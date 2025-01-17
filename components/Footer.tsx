// import Link from "next/link";

import { XIcon } from "./XIcon";

export default function Footer() {
  return (
    <footer className="h-16 py-4 text-center  border-t border-white/20 backdrop-blur-sm bg-white/30">
      <div className="flex flex-col items-center justify-center gap-1 text-slate-700/25 text-xs">
        <div className="flex items-center gap-2 ">
          <span>Designed by @tar_uniqueee</span>
          <span className=" "> Built with 🔨 and 💛 by </span>
          <a
            href="https://x.com/deifosv"
            target="_blank"
            rel="noopener noreferrer"
            className=""
          >
            Vlad
          </a>
          <a
            href="https://x.com/deifosv"
            target="_blank"
            rel="noopener noreferrer"
            className=""
          >
            <XIcon className="w-5 h-5" />
          </a>
          <span className="">powered by </span>
          <span>
            <a
              href="https://fal.ai/"
              target="_blank"
              rel="noreferrer"
              className=""
            >
              FalAI
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
