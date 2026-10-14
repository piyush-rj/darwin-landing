import { BsArrowDownShort } from "react-icons/bs";
import { MdChevronRight, MdOutlineKeyboardArrowRight, MdSearch } from "react-icons/md";
import { Add, Menu4 } from "reicon-react";

import { createIcon } from "./createIcon";
import { createReiconIcon } from "./createReiconIcon";

export const CtaArrowIcon = createIcon(MdChevronRight);

export const FooterLinkHoverArrowIcon = createIcon(BsArrowDownShort);

export const SearchIcon = createIcon(MdSearch);

export const MobileNavIcon = createReiconIcon(Menu4);

export const MobileNavCloseIcon = createReiconIcon(Add);

export const BreadcrumbSeparatorIcon = createIcon(MdOutlineKeyboardArrowRight);
