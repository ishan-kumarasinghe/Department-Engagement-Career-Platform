# DECP AWS Deployment Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph Internet["☁️ Internet"]
        Browser["🖥️ Web Browser"]
        Mobile["📱 Mobile App"]
    end

    subgraph AWS["AWS Cloud (eu-north-1)"]

        subgraph VPC["Default VPC"]

            subgraph ALB_Layer["Public Subnet - Application Load Balancer"]
                ALB["Application Load Balancer<br/>decp-alb<br/>🔒 SG: decp-alb-sg<br/>Inbound: HTTP 80, HTTPS 443"]
            end

            subgraph ECS_Cluster["ECS Fargate Cluster - DECP-Production-Cluster"]

                subgraph Public_Services["Load Balancer Connected Services"]
                    FE["📦 frontend-svc<br/>React + Nginx<br/>Port 80<br/>Target Group: decp-frontend-tg"]
                    APIGW["📦 api-gateway-svc<br/>Express + Proxy<br/>Port 3000<br/>Target Group: decp-api-gateway-tg"]
                end

                subgraph Internal_Services["Internal Services (Service Connect: decp.local)"]
                    US["📦 user-service-svc<br/>Express + Mongoose<br/>Port 3001<br/>DNS: user-service.decp.local"]
                    CS["📦 content-service-svc<br/>Express + Mongoose<br/>Port 3002<br/>DNS: content-service.decp.local"]
                    NS["📦 notification-service-svc<br/>Express + Mongoose<br/>Port 3003<br/>DNS: notification-service.decp.local"]
                    CHS["📦 chat-service-svc<br/>Express + Mongoose<br/>Port 3004<br/>DNS: chat-service.decp.local"]
                end
            end

            subgraph MQ_Layer["Amazon MQ"]
                RMQ["🐰 Amazon MQ for RabbitMQ<br/>decp-rabbitmq-broker<br/>mq.t3.micro<br/>Port 5671 (AMQPS)"]
            end

        end
    end

    subgraph External["External Services"]
        MONGO_USER["🍃 MongoDB Atlas<br/>User DB"]
        MONGO_CONTENT["🍃 MongoDB Atlas<br/>Content DB"]
        MONGO_CHAT["🍃 MongoDB Atlas<br/>Chat DB"]
        MONGO_NOTIF["🍃 MongoDB Atlas<br/>Notification DB"]
        DOCKER["🐳 Docker Hub<br/>Container Registry"]
    end

    subgraph IAM["AWS IAM & Config"]
        SSM["🔑 SSM Parameter Store<br/>/decp/prod/*<br/>JWT_SECRET, MONGO_URIs,<br/>RABBITMQ_URL"]
        ROLE["👤 ecsTaskExecutionRole<br/>+ AmazonSSMReadOnlyAccess<br/>+ CloudWatchLogsFullAccess"]
        CW["📊 CloudWatch Logs<br/>/ecs/api-gateway-svc<br/>/ecs/user-service-svc<br/>/ecs/content-service-svc<br/>..."]
    end

    %% Traffic Flow
    Browser -->|"HTTP :80"| ALB
    Mobile -->|"HTTP :80"| ALB
    ALB -->|"Path: /api/*<br/>Priority 1"| APIGW
    ALB -->|"Default Rule<br/>All other traffic"| FE

    %% API Gateway Proxy Routes
    APIGW -->|"/api/auth, /api/users"| US
    APIGW -->|"/api/content"| CS
    APIGW -->|"/api/notifications"| NS
    APIGW -->|"/api/chat"| CHS

    %% Database Connections
    US -->|"MONGO_URI_USER"| MONGO_USER
    CS -->|"MONGO_URI_CONTENT"| MONGO_CONTENT
    CHS -->|"MONGO_URI_CHAT"| MONGO_CHAT
    NS -->|"MONGO_URI_NOTIFICATION"| MONGO_NOTIF

    %% RabbitMQ Connections
    US -->|"Publish Events"| RMQ
    CS -->|"Publish Events"| RMQ
    CHS -->|"Publish Events"| RMQ
    NS -->|"Consume Events"| RMQ

    %% IAM
    ROLE -.->|"Fetch Secrets"| SSM
    ROLE -.->|"Push Logs"| CW
    DOCKER -.->|"Pull Images"| ECS_Cluster

    %% Styles
    classDef aws fill:#FF9900,stroke:#232F3E,color:#232F3E,font-weight:bold
    classDef service fill:#1A73E8,stroke:#0D47A1,color:white
    classDef external fill:#4CAF50,stroke:#2E7D32,color:white
    classDef security fill:#E91E63,stroke:#880E4F,color:white

    class ALB aws
    class RMQ aws
    class SSM,ROLE,CW security
    class FE,APIGW,US,CS,NS,CHS service
    class MONGO_USER,MONGO_CONTENT,MONGO_CHAT,MONGO_NOTIF,DOCKER external
```

## Security Groups

```mermaid
graph LR
    subgraph SG1["🔒 decp-alb-sg"]
        direction TB
        IN1["Inbound:<br/>HTTP 80 from 0.0.0.0/0<br/>HTTPS 443 from 0.0.0.0/0"]
    end

    subgraph SG2["🔒 decp-internal-containers-sg"]
        direction TB
        IN2["Inbound:<br/>TCP 3000 from decp-alb-sg<br/>TCP 80 from decp-alb-sg<br/>All TCP from self"]
    end

    SG1 -->|"Forwards to"| SG2
```

## ALB Routing Rules

| Priority | Condition | Action | Target |
|----------|-----------|--------|--------|
| 1 | Path = `/api/*` | Forward | `decp-api-gateway-tg` (Port 3000) |
| Default | All other paths | Forward | `decp-frontend-tg` (Port 80) |

## ECS Service Connect Namespace

| Service | Discovery Name | DNS | Port |
|---------|---------------|-----|------|
| api-gateway-svc | api-gateway | api-gateway.decp.local | 3000 |
| user-service-svc | user-service | user-service.decp.local | 3001 |
| content-service-svc | content-service | content-service.decp.local | 3002 |
| notification-service-svc | notification-service | notification-service.decp.local | 3003 |
| chat-service-svc | chat-service | chat-service.decp.local | 3004 |

## SSM Parameters

| Parameter | Used By |
|-----------|---------|
| `/decp/prod/JWT_SECRET` | user-service |
| `/decp/prod/MONGO_URI_USER` | user-service |
| `/decp/prod/MONGO_URI_CONTENT` | content-service |
| `/decp/prod/MONGO_URI_CHAT` | chat-service |
| `/decp/prod/MONGO_URI_NOTIFICATION` | notification-service |
| `/decp/prod/RABBITMQ_URL` | All 4 backend services |
| `/decp/prod/JWT_EXPIRES_IN` | user-service |
| `/decp/prod/REFRESH_TOKEN_EXPIRES_IN` | user-service |

## Request Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant ALB as Load Balancer
    participant FE as Frontend (Nginx)
    participant AG as API Gateway
    participant US as User Service
    participant DB as MongoDB Atlas
    participant MQ as Amazon MQ

    Note over B,MQ: Page Load Flow
    B->>ALB: GET / (HTTP 80)
    ALB->>FE: Forward (default rule)
    FE-->>B: React SPA (HTML/JS/CSS)

    Note over B,MQ: Login Flow
    B->>ALB: POST /api/auth/login
    ALB->>AG: Forward (path: /api/*)
    AG->>US: Proxy to user-service.decp.local:3001
    US->>DB: Validate credentials
    DB-->>US: User found
    US->>MQ: Publish USER_LOGGED_IN event
    US-->>AG: JWT Token + User Data
    AG-->>ALB: Response
    ALB-->>B: 200 OK + Token
```
