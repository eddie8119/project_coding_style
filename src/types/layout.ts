export interface MenuItem {
  label: string;
  name: string;
  icon: string;
  route: string;
}

export interface Menu {
  group: string;
  items: MenuItem[];
}

export interface Tab {
  label: string;
  name: string;
}

// header
export interface NavItem {
  id: number;
  name: string;
  icon: string;
  label: string;
  action: (value: string) => void;
  dropdownItems?: { label: string; value: string }[];
}
