const Achievement = () => {  return (
    <div class="achivements">
      <div class="container">
        <div class="row">
          <div class="col-lg-3 col-md-6 col-12">
            <div class="achive-text">3M Registered Members</div>
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <div class="achive-text">786k Jobs Found</div>
          </div>
          <div class="col-lg-2 col-md-6 col-12">
            <div class="achive-text">1.2K Best Companies</div>
          </div>
          <div class="col-lg-4 col-md-6 col-12">
            <ul class="post-buttons">
              <li>
                <button
                  class="add-job"
                  onclick="window.location.href = 'post_a_job.html';"
                >
                  Post a Job
                </button>
              </li>
              <li>
                <button
                  class="add-project"
                  onclick="window.location.href = 'post_a_project.html';"
                >
                  Post a Work
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievement;
