import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Navbar } from "../components/shared/navbar";
import localFont from "next/font/local";

const acumin = localFont({
  src: [
    {
      path: "../../public/fonts/acumin-pro/Acumin-RPro.otf",
      weight: "400",
    },
    {
      path: "../../public/fonts/acumin-pro/Acumin-BdPro.otf",
      weight: "700",
    },
    {
      path: "../../public/fonts/acumin-pro/Acumin-ItPro.otf",
      style: "italic",
    },
  ],
  variable: "--font-acumin",
});

const ibmPlex = localFont({
  src: [
    {
      path: "../../public/fonts/ibm-plex/IBMPlexMono-Regular.ttf",
      weight: "400",
    },
  ],
  variable: "--font-ibmplex",
});

const termina = localFont({
  src: [
    {
      path: "../../public/fonts/termina/Termina-Regular.otf",
      weight: "400",
    },
    {
      path: "../../public/fonts/termina/Termina-Bold.otf",
      weight: "700",
    },
    {
      path: "../../public/fonts/termina/Termina-Heavy.otf",
      weight: "800",
    },
  ],
  variable: "--font-termina",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div
      // className={`${acumin.variable} ${termina.variable} ${ibmPlex.variable}`}
      className={`${acumin.variable} ${termina.variable} ${ibmPlex.variable}`}
    >
      <Navbar />
      <div className="min-h-screen bg-primary-gray-50">
        <div className="pb-16">
          <Component {...pageProps} />
        </div>
      </div>
    </div>
  );
}
