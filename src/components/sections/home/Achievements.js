const Achievement = () => {
  return (
    <div className="achivements">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 col-12">
            <div className="achive-text">3M Registered Members</div>
          </div>
          <div className="col-lg-3 col-md-6 col-12">
            <div className="achive-text">786k Jobs Found</div>
          </div>
          <div className="col-lg-2 col-md-6 col-12">
            <div className="achive-text">1.2K Best Companies</div>
          </div>
          <div className="col-lg-4 col-md-6 col-12">
            <ul className="post-buttons">
              <li>
                <button className="add-job">Post a Job</button>
              </li>
              <li>
                <button className="add-project">Post a Work</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievement;
