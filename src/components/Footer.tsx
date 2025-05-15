import {
	Facebook,
	Instagram,
	Youtube,
	MessageCircleMore // usado para WhatsApp
} from "lucide-react";

export default function Footer() {
	return (
		<footer
			className="py-6 md:px-8 md:py-0 border-t"
			style={{ backgroundColor: "rgb(212, 241, 249)" }}
		>
			<div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
				<p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
					Creado por Miguelet LavaCarWash. &copy; {new Date().getFullYear()} Todos los derechos reservados.
				</p>

				{/* Redes sociales */}
				<p className="text-center text-sm leading-loose">
					Nuestras redes
				</p>
			
				<div className="flex space-x-4">
					<a href="https://www.facebook.com/people/Lavacarwash/61560241408703/" target="_blank" rel="noopener noreferrer" title="Siguenos en Facebook" aria-label="Facebook">
						<Facebook className="w-5 h-5 hover:text-blue-900" />
					</a>
					<a href="https://www.instagram.com/lavacarwash.esp/" target="_blank" rel="noopener noreferrer" title="Siguenos en Instagram" aria-label="Instagram">
						<Instagram className="w-5 h-5 hover:text-pink-900" />
					</a>
					<a href="https://www.tiktok.com/@lavacarwash?_t=8n5Ywe8xVEP&_r=1" target="_blank" rel="noopener noreferrer" title="Siguenos en TikTok" aria-label="TikTok">
						<svg
							className="w-5 h-5 hover:text-black"
							viewBox="0 0 256 256"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M173.3,21.3c7.6,14.1,18.5,25.4,32.6,32.8c6.3,3.3,13.2,5.6,20.3,6.6v33.7c-19.3-1.2-38.2-7.8-53.9-19.5v77.4c0,54.1-43.9,98-98,98c-14.2,0-27.7-3-40-8.4v-38.2c0.1,0,0.1,0,0.2,0c21.8,0,39.5-17.7,39.5-39.5s-17.7-39.5-39.5-39.5c-0.1,0-0.1,0-0.2,0V95.2c12.3-5.4,25.8-8.4,40-8.4c15.4,0,30,3.7,43,10.4V0h33.9C172.3,7.3,172.8,14.4,173.3,21.3z" />
						</svg>
					</a>
					<a href="https://wa.me/34613728657" target="_blank" rel="noopener" title="Contacta por  Wassap"  data-v-17c99e7b=""><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M20.4054 3.4875C18.1607 1.2375 15.1714 0 11.9946 0C5.4375 0 0.101786 5.33571 0.101786 11.8929C0.101786 13.9875 0.648214 16.0339 1.6875 17.8393L0 24L6.30536 22.3446C8.04107 23.2929 9.99643 23.7911 11.9893 23.7911H11.9946C18.5464 23.7911 24 18.4554 24 11.8982C24 8.72143 22.65 5.7375 20.4054 3.4875ZM11.9946 21.7875C10.2161 21.7875 8.475 21.3107 6.95893 20.4107L6.6 20.1964L2.86071 21.1768L3.85714 17.5286L3.62143 17.1536C2.63036 15.5786 2.11071 13.7625 2.11071 11.8929C2.11071 6.44464 6.54643 2.00893 12 2.00893C14.6411 2.00893 17.1214 3.0375 18.9857 4.90714C20.85 6.77679 21.9964 9.25714 21.9911 11.8982C21.9911 17.3518 17.4429 21.7875 11.9946 21.7875ZM17.4161 14.3839C17.1214 14.2339 15.6589 13.5161 15.3857 13.4196C15.1125 13.3179 14.9143 13.2696 14.7161 13.5696C14.5179 13.8696 13.95 14.5339 13.7732 14.7375C13.6018 14.9357 13.425 14.9625 13.1304 14.8125C11.3839 13.9393 10.2375 13.2536 9.08571 11.2768C8.78036 10.7518 9.39107 10.7893 9.95893 9.65357C10.0554 9.45536 10.0071 9.28393 9.93214 9.13393C9.85714 8.98393 9.2625 7.52143 9.01607 6.92679C8.775 6.34821 8.52857 6.42857 8.34643 6.41786C8.175 6.40714 7.97679 6.40714 7.77857 6.40714C7.58036 6.40714 7.25893 6.48214 6.98571 6.77679C6.7125 7.07679 5.94643 7.79464 5.94643 9.25714C5.94643 10.7196 7.0125 12.1339 7.15714 12.3321C7.30714 12.5304 9.25179 15.5304 12.2357 16.8214C14.1214 17.6357 14.8607 17.7054 15.8036 17.5661C16.3768 17.4804 17.5607 16.8482 17.8071 16.1518C18.0536 15.4554 18.0536 14.8607 17.9786 14.7375C17.9089 14.6036 17.7107 14.5286 17.4161 14.3839Z" fill="currentColor"></path>
					</svg>
					</a>
					<a href="https://www.youtube.com/@LavaCarWash" target="_blank" rel="noopener noreferrer" title="Ir a youtube" aria-label="YouTube">
						<Youtube className="w-5 h-5 hover:text-red-600" />
					</a>
				</div>
			</div>
		</footer>
	);
}
