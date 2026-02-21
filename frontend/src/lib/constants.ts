// Site metadata and configuration
export const siteConfig = {
  name: "Ömer Faruk Uysal",
  title: "Full Stack Developer",
  description: "Modern teknolojilerle dijital deneyimler oluşturuyorum. Performans, erişilebilirlik ve güzel tasarım odaklı çalışıyorum.",
  url: "https://portfolio.dev",
  ogImage: "/og-image.jpg",
  links: {
    github: "https://github.com/electrichunter",
    linkedin: "https://www.linkedin.com/in/omer-farukuysal/",
    email: "ouysal155@gmail.com",
  },
};

// Navigation items
export const navigation = [
  { name: "Ana Sayfa", href: "/" },
  { name: "Projeler", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Hakkımda", href: "/about" },
];

// Social links
export const socialLinks = [
  { name: "GitHub", href: siteConfig.links.github, icon: "Github" },
  { name: "LinkedIn", href: siteConfig.links.linkedin, icon: "Linkedin" },
];

// Footer links
export const footerLinks = {
  navigation: [
    { name: "Ana Sayfa", href: "/" },
    { name: "Projeler", href: "/projects" },
    { name: "Blog", href: "/blog" },
    { name: "Hakkımda", href: "/about" },
  ],
  social: socialLinks,
};
