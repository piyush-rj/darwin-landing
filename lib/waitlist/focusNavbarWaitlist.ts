export const FOCUS_NAVBAR_WAITLIST_EVENT = "focus-navbar-waitlist";

export function focusNavbarWaitlist() {
    window.dispatchEvent(new Event(FOCUS_NAVBAR_WAITLIST_EVENT));
}
