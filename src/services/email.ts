import emailjs from "@emailjs/browser";

export async function sendEmail(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  date: string;
  time: string;
  comments: string;
}) {
  const templateParams = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    service: data.service,
    date: data.date,
    time: data.time,
    comments: data.comments,
  };

  await emailjs.send(
    "service_r73cgal",     // Tu Service ID
    "template_0f6ylcp",     // Tu Template ID
    templateParams,
    "128GbJelBfWA-xa9Y"     // Tu Public Key
  );
}