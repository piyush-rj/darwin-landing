import "./globals.css";

import type { Metadata } from "next";
import { Geist_Mono, Google_Sans_Flex, JetBrains_Mono, Titillium_Web } from "next/font/google";
import localFont from "next/font/local";

import MotionProvider from "@/providers/MotionProvider";

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
});

const googleSansFlex = Google_Sans_Flex({
    variable: "--font-google-sans-flex",
    subsets: ["latin"],
});

const departureMono = localFont({
    src: "../public/fonts/DepartureMono-Regular.woff2",
    variable: "--font-departure-mono",
    weight: "400",
    display: "swap",
});

const titilliumWeb = Titillium_Web({
    variable: "--font-titillium-web",
    subsets: ["latin"],
    weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
    title: "Darwin",
    description: "Darwin turns the issues your team files into tested pull requests.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${googleSansFlex.variable} ${geistMono.variable} ${jetBrainsMono.variable} ${titilliumWeb.variable} ${departureMono.variable} h-full antialiased`}
        >
            <body className="theme-light min-h-full flex flex-col">
                <MotionProvider>{children}</MotionProvider>
            </body>
        </html>
    );
}
