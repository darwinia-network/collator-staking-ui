import Image from "next/image";

const socialConfig: { url: string; name: string; iconPath: string }[] = [
  {
    name: "Github",
    iconPath: "/images/social/github.svg",
    url: "https://github.com/darwinia-network",
  },
  {
    name: "Twitter",
    iconPath: "/images/social/twitter.svg",
    url: "https://twitter.com/DarwiniaNetwork",
  },
  {
    name: "Medium",
    iconPath: "/images/social/medium.svg",
    url: "https://medium.com/darwinianetwork",
  },
  {
    name: "Telegram",
    iconPath: "/images/social/telegram.svg",
    url: "https://t.me/DarwiniaNetwork",
  },
  {
    name: "Discord",
    iconPath: "/images/social/discord.svg",
    url: "https://discord.com/invite/VcYFYETrw5",
  },
  {
    name: "Element",
    iconPath: "/images/social/element.svg",
    url: "https://app.element.io/#/room/#darwinia:matrix.org",
  },

  {
    name: "Email",
    iconPath: "/images/social/email.svg",
    url: "mailto:hello@darwinia.network",
  },
];

export default function Footer({ className }: { className: string }) {
  return (
    <div className={`${className} flex items-center`}>
      <div className="container mx-auto flex items-center justify-center lg:justify-between">
        {/* copyright */}
        <span className="text-sm font-light capitalize text-white/50">
          &copy; {new Date().getUTCFullYear()} Darwinia Network
        </span>

        {/* social */}
        <div className="hidden items-center gap-5 lg:flex">
          {socialConfig.map(({ url, name, iconPath }, index) => (
            <a
              key={index}
              href={url}
              rel="noopener"
              target="_blank"
              className="transition hover:scale-105 hover:opacity-80 active:scale-95 active:opacity-60"
            >
              <Image src={iconPath} width={20} height={20} alt={`Icon of ${name}`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
