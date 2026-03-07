import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, DollarSign, Clock, Users, X, AlertCircle } from 'lucide-react';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [filter, setFilter] = useState('all'); // all, applied, my-posts
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    type: 'internship', // internship, full-time, part-time
    salary: '',
    deadline: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  useEffect(() => {
    const mockJobs = [
      {
        id: '1',
        title: 'Full-Stack Developer Internship',
        company: 'Tech Corp',
        description: 'Join our team to build scalable web applications using React and Node.js. You will work on real projects and learn from experienced mentors.',
        location: 'New York, NY',
        type: 'internship',
        salary: '$20-25/hr',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        postedBy: { _id: 'alumni1', fullName: 'John Alumni', role: 'alumni' },
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        applicants: 12,
      },
      {
        id: '2',
        title: 'Data Science Associate',
        company: 'AI Innovations Ltd',
        description: 'Help us build machine learning models. Experience with Python, TensorFlow required.',
        location: 'San Francisco, CA',
        type: 'full-time',
        salary: '$80,000-120,000',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        postedBy: { _id: 'admin1', fullName: 'Dr. Admin', role: 'admin' },
        postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        applicants: 8,
      },
    ];
    setJobs(mockJobs);
  }, []);

  const isAlumniOrAdmin = user?.role === 'alumni' || user?.role === 'admin';

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setError('');

    if (!jobForm.title || !jobForm.company || !jobForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // In production, call contentApi.post('/api/jobs', {...})
      const newJob = {
        id: Date.now().toString(),
        ...jobForm,
        deadline: new Date(jobForm.deadline),
        postedBy: user,
        postedAt: new Date(),
        applicants: 0,
      };

      setJobs([newJob, ...jobs]);
      setJobForm({
        title: '',
        company: '',
        description: '',
        location: '',
        type: 'internship',
        salary: '',
        deadline: '',
      });
      setShowCreateJob(false);
    } catch (err) {
      setError('Failed to create job posting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyJob = (jobId) => {
    const newApplied = new Set(appliedJobs);
    if (newApplied.has(jobId)) {
      newApplied.delete(jobId);
    } else {
      newApplied.add(jobId);
    }
    setAppliedJobs(newApplied);

    // In production, call contentApi.post(`/api/jobs/${jobId}/apply`)
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'applied') return appliedJobs.has(job.id);
    if (filter === 'my-posts') return job.postedBy._id === user?._id;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Jobs & Internships
          </h1>
          <p className="text-gray-600">Find opportunities posted by alumni and faculty</p>
        </div>

        {isAlumniOrAdmin && (
          <button
            onClick={() => setShowCreateJob(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium whitespace-nowrap"
          >
            + Post Job
          </button>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Post a Job Opportunity</h2>
              <button
                onClick={() => setShowCreateJob(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g., Full-Stack Developer"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    placeholder="Company Name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opportunity Type
                  </label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="internship">Internship</option>
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="City, State"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary/Stipend
                  </label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    placeholder="e.g., $50,000 - $70,000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                  rows="6"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateJob(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-3 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-3 font-medium border-b-2 transition-all ${
            filter === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-700 hover:text-gray-900'
          }`}
        >
          All Jobs
        </button>
        <button
          onClick={() => setFilter('applied')}
          className={`px-4 py-3 font-medium border-b-2 transition-all ${
            filter === 'applied'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-700 hover:text-gray-900'
          }`}
        >
          Applied
        </button>
        {isAlumniOrAdmin && (
          <button
            onClick={() => setFilter('my-posts')}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${
              filter === 'my-posts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            My Posts
          </button>
        )}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 font-medium">{job.company}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} className="text-gray-400" />
                      {job.location}
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} className="text-gray-400" />
                      {job.salary}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-gray-400" />
                    {formatTime(job.postedAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} className="text-gray-400" />
                    {job.applicants} applicants
                  </div>
                </div>

                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full capitalize">
                    {job.type}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 justify-start">
                {appliedJobs.has(job.id) ? (
                  <button
                    onClick={() => handleApplyJob(job.id)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-all whitespace-nowrap"
                  >
                    Applied ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handleApplyJob(job.id)}
                    disabled={user?.role === 'admin' || user?.role === 'alumni'}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                  >
                    Apply Now
                  </button>
                )}
                {job.deadline && (
                  <p className="text-xs text-gray-500 text-center">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No jobs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
