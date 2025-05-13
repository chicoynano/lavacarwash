export async function sendEmail(data: {
	to_email: string;
	from_name: string;
	subject: string;
	client_name: string;
	service_name: string;
	booking_date: string;
	booking_time: string;
	booking_address: string;
	booking_phone: string;
	booking_comments: string;
	date?: any; // Optional property based on previous code
	time?: any; // Optional property based on previous code
	// Add any other variables needed by your specific EmailJS template
	// e.g., booking_id: string;
	// e.g., comments: string;
	name?: string; // Added for mapping to {{name}} in EmailJS template config
	title?: string; // Added for mapping to {{title}} in EmailJS template config
	email?: string; // Added for mapping to {{email}} in EmailJS template config
	templateId: string; // Added templateId as a required parameter
}) {
	// Ensure this function is only called on the server
	if (typeof window !== 'undefined') {
		console.error("sendEmail should only be called on the server.");
		// Return an error indication specific to being called on the client
		return { success: false, error: "Attempted to send email from client-side." };
	}

	const templateParams = {
		// Ensure these parameters match your EmailJS template variables
		// The names here should be exactly as they are in your EmailJS template
		// Examples based on common EmailJS template variables:
		to_email: data.to_email,
		from_name: data.from_name,
		subject: data.subject,
		client_name: data.client_name, // Corresponds to {{client_name}} in template content
		service_name: data.service_name,
		booking_date: data.booking_date,
		booking_time: data.booking_time,
		booking_address: data.booking_address,
		booking_phone: data.booking_phone,
		booking_id: data.booking_id,
		booking_comments: data.booking_comments || '', // Use booking_comments property from input data
	};
	// Include properties used in EmailJS template configuration (like From Name, Subject, and Reply To)
	if (data.name) templateParams.name = data.name;
	if (data.title) templateParams.title = data.title;
	if (data.email) templateParams.email = data.email;

	console.log("EmailJS Request Body:", templateParams); // Log the request body

	// Get EmailJS credentials from environment variables
	const serviceId = process.env.EMAILJS_SERVICE_ID;
	const publicKey = process.env.EMAILJS_PUBLIC_KEY; // Use public key as user_id for server-side

	// Check if environment variables are defined
	if (!serviceId || !publicKey) {
		console.error("EmailJS environment variables not defined.");
		return { success: false, error: "Email sending not configured: Missing service ID or public key." };
	}

	try {
		// Use the EmailJS server-side send method (adjust if using a different method)
		// Since we are not using a specific EmailJS server SDK, we use fetch directly.
		// The API endpoint for sending emails is typically: https://api.emailjs.com/api/v1.0/email/send
		const apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
		const body = {
			service_id: serviceId,
			template_id: data.templateId,
			user_id: publicKey, // Use public key as user_id for server-side
			template_params: templateParams,
		};

		console.log("EmailJS Request Body:", JSON.stringify(body)); // Log the actual request body sent

		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorText = await response.text(); // Attempt to get error details from response body
			throw new Error(`Email sending failed with status ${response.status}: ${errorText}`);
		}

		console.log("Email sent successfully via EmailJS API");
		return { success: true }; // Indicate success
	} catch (error: any) {
		console.error("Failed to send email via EmailJS:", error);
		return { success: false, error: error.message || "An unknown error occurred during email sending." }; // Return error message
	}
}