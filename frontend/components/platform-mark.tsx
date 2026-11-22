import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faBilibili } from "@fortawesome/free-brands-svg-icons/faBilibili";
import { faDiscord } from "@fortawesome/free-brands-svg-icons/faDiscord";
import { faInstagram } from "@fortawesome/free-brands-svg-icons/faInstagram";
import { faPixiv } from "@fortawesome/free-brands-svg-icons/faPixiv";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons/faXTwitter";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons/faBookOpen";
import { faFeatherPointed } from "@fortawesome/free-solid-svg-icons/faFeatherPointed";
import { faGlobe } from "@fortawesome/free-solid-svg-icons/faGlobe";
import { faHashtag } from "@fortawesome/free-solid-svg-icons/faHashtag";
import { faUsers } from "@fortawesome/free-solid-svg-icons/faUsers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Platform } from "@/lib/platforms";

const icons: Record<Platform["id"], IconDefinition> = {
  x: faXTwitter,
  instagram: faInstagram,
  discord: faDiscord,
  pixiv: faPixiv,
  bilibili: faBilibili,
  lofter: faFeatherPointed,
  rednote: faBookOpen,
  "qq-channel": faHashtag,
  "qq-group": faUsers,
  web: faGlobe,
};

export function PlatformMark({ platform }: { platform: Platform }) {
  return (
    <span
      className={`platform-mark platform-mark--${platform.id}`}
      aria-hidden="true"
    >
      <FontAwesomeIcon icon={icons[platform.id]} />
    </span>
  );
}
