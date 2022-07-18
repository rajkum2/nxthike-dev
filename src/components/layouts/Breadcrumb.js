export default function Breadcrumb(props) {
  return (
    <div class="title-bar">
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <ol class="title-bar-text">
              <li class="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                {props.pagename}
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
