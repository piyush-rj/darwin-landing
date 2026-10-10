import { LANDING_DARK_CLASS, LANDING_THEME_STORAGE_KEY } from "@/lib/landingTheme";

const script = `try{if(JSON.parse(localStorage.getItem("${LANDING_THEME_STORAGE_KEY}")).state.theme==="dark"){document.currentScript.parentElement.classList.add("${LANDING_DARK_CLASS}")}}catch(e){}`;

export default function LandingThemeGuard() {
    return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
