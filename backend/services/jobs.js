const { v4: uuidv4 } = require('uuid');

const jobQueue = [];

function enqueueJob(job) {
  const item = {
    ...job,
    id: job.id || uuidv4(),
    status: job.status || 'queued',
    createdAt: new Date().toISOString(),
  };

  jobQueue.push(item);
  return item;
}

function listJobs() {
  return jobQueue;
}

module.exports = { enqueueJob, listJobs };
