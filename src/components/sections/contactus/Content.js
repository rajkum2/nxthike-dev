export default function Content(){
    return(
<main class="contact-section">				
			<div class="contact_info">
				<div class="container">
					<div class="row">
						<div class="col-lg-6">
							<div class="contact_dts">
								<h6>Opening a ticket is the fastest and most efficient method of support.</h6>
								<div class="main-heading bids_heading">
									<h2>Contact Information</h2>
									<div class="line-shape1">
										<img src="images/line.svg" alt=""/>
									</div>
								</div>
								<ul class="cinfo10">
									<li><p><span><i class="fas fa-map-marker-alt"></i>Address :</span>#1234, Sks Nagar, Near MBD Mall, 141001 Ludhiana, Punjab, India</p></li>
									<li><p><span><i class="fas fa-envelope"></i>Email Address :</span>Support@jobby.com</p></li>
								</ul>
							</div>
						</div>
						<div class="col-lg-6">
							<div class="contact_form">
								<div class="main-heading">
									<h2>Open a Ticket</h2>
									<div class="line-shape1">
										<img src="images/line.svg" alt=""/>
									</div>
								</div>
								<form>
									<div class="row">
										<div class="col-lg-6 col-md-6">
											<div class="form-group">
												<label class="label15">Name*</label>
												<input type="text" class="job-input" placeholder="Enter Name"/>
											</div>
										</div>
										<div class="col-lg-6 col-md-6">
											<div class="form-group">
												<label class="label15">Email Address*</label>
												<input type="email" class="job-input" placeholder="Enter Email Address"/>
											</div>
										</div>
										<div class="col-lg-12">
											<div class="form-group">
												<label class="label15">Subject*</label>
												<input type="text" class="job-input" placeholder="Enter Subject"/>
											</div>
										</div>
										<div class="col-lg-12">
											<div class="form-group">
												<label class="label15">Message*</label>
												<textarea class="note-input" placeholder="Text Message"></textarea>
											</div>
										</div>
										<div class="col-lg-12">
											<button class="withdraw_btn" type="submit">Send Message</button>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
    )
    
}