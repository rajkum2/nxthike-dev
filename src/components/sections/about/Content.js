import line from "../../../assets/images/line.svg";
import team from "../../../assets/images/about/team-1.jpg";
const Content = () => {
  return (
    <main class="browse-section">
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <div class="main-heading">
              <h2>About Us</h2>
              <div class="line-shape1">
                <img src={line} alt="" />
              </div>
            </div>
            <div class="about_des">
              <p>
                Vivamus tortor nisl, lobortis in, faucibus et, tempus at, dui.
                Nunc risus. Proin scelerisque augue. Nam ullamcorper. Phasellus
                id massa. Pellentesque nisl. Pellentesque habitant tuni morbi
                tristique senectus et netus et malesuada fames ac turpis
                egestas. Nunc augue. Aenean sed justo non leo vehicula laoreet.
                Praesent ipsum libero, auctor ac, tempus nec, casion tempor nec,
                justo cretusi sino zumbua iloseum musumfu lilokuta nabase uchiha
                itachi suctung from munual pracetamol curom ose testio soel
                lorem isutm pausm mintest osrit ucii
              </p>
              <p>
                Maecenas ullamcorper, odio vel tempus egestas, dui orci faucibus
                orci, sit amet aliquet lectus dolor et quam. Pellentesque
                consequat luctus purus. Nunc et risus. Etiam a nibh tunil
                Phasellus dignissim metus eget nisi. Vestibulum sapien dolor,
                aliquet nec, porta ac, malesuada a, libero. Praesent feugiat
                purus eget est. Nulla facilisi. Vestibulum tincidunt sapiens eu
                velit. Mauris purus. Maecenas eget mauris eu orci accumsan
                feugiat. Pellentesque eget velit. Nunc tincidunt.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="choose_us">
        <div class="container">
          <div class="row">
            <div class="col-lg-6 col-md-12">
              <div class="choose_left">
                <div class="main-heading bids_heading">
                  <h2>Why Choose Us</h2>
                  <div class="line-shape1">
                    <img src={line} alt="" />
                  </div>
                </div>
                <div class="choose_des">
                  <p>
                    Fusce dictum mauris nec magna consequat, ut semper leo
                    pulvinar. Cras rhoncus lorem lorem, a fermentum lacus congue
                    vehicula. Nullam luctus mi eget nisl tincidunt lobortis.
                  </p>
                  <ul>
                    <li>
                      <div class="abt142">
                        <i class="fas fa-check-circle"></i>
                        <p>
                          Cras rhoncus lorem lorem, a fermentum lacus congue
                          vehicula. Nullam luct us mi eget nisl tincidunt
                          lobortis.
                        </p>
                      </div>
                    </li>
                    <li>
                      <div class="abt142">
                        <i class="fas fa-check-circle"></i>
                        <p>
                          Cras rhoncus lorem lorem, a fermentum lacus congue
                          vehicula. Nullam luct us mi eget nisl tincidunt
                          lobortis.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-lg-6 col-md-12">
              <div class="about_video">
                <iframe
                  src="https://www.youtube.com/embed/TKnufs85hXk"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="our_team">
        <div class="container">
          <div class="row">
            <div class="col-md-12">
              <div class="main-heading">
                <h2>Meet Our Team</h2>
                <div class="line-shape1">
                  <img src={line} alt="" />
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6">
              <div class="team_item">
                <div class="team_img">
                  <img src={team} alt="" />
                </div>
                <h4>John Doe</h4>
                <span>CEO</span>
                <ul class="team_links">
                  <li>
                    <a href="#">
                      <i class="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-youtube"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6">
              <div class="team_item">
                <div class="team_img">
                  <img src={team} alt="" />
                </div>
                <h4>Rock Smith</h4>
                <span>CTO</span>
                <ul class="team_links">
                  <li>
                    <a href="#">
                      <i class="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-youtube"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6">
              <div class="team_item">
                <div class="team_img">
                  <img src={team} alt="" />
                </div>
                <h4>Jassica William</h4>
                <span>Senior Developer</span>
                <ul class="team_links">
                  <li>
                    <a href="#">
                      <i class="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-youtube"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6">
              <div class="team_item">
                <div class="team_img">
                  <img src={team} alt="" />
                </div>
                <h4>Johnson</h4>
                <span>UI/UX Designer</span>
                <ul class="team_links">
                  <li>
                    <a href="#">
                      <i class="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i class="fab fa-youtube"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Content;
