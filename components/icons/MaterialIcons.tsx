/**
 * Material Symbols (outlined, weight 400), inlined from @material-symbols/svg-400.
 * Material's icon grid is `0 -960 960 960` — keep that viewBox when adding more.
 */

interface IconProps {
  size?: number;
  className?: string;
}

function Icon({
  size = 20,
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Dashed speech bubble — participant is still talking */
export function ChatDashedIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M80-470v-180h60v180H80Zm0 390v-330h60v190l74-80h116v60h-90L80-80Zm310-160v-60h180v60H390Zm240 0v-60h190v-110h60v110q0 24-18 42t-42 18H630Zm190-230v-180h60v180h-60Zm0-239v-111H630v-60h190q24 0 42 18t18 42v111h-60ZM390-820v-60h180v60H390ZM80-709v-111q0-24 18-42t42-18h190v60H140v111H80Z" />
    </Icon>
  );
}

/** Speech bubble with a check — participant is ready / wrapped up */
export function MarkChatReadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M701-160 567-294l42-42 92 91 177-177 42 43-219 219ZM80-80v-740q0-24 18-42t42-18h680q24 0 42 18t18 42v310h-60v-310H140v600l74-80h276v60H240L80-80Zm60-220v-520 520Z" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M378-246 154-470l43-43 181 181 384-384 43 43-427 427Z" />
    </Icon>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M450-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h170v60H280q-58.33 0-99.17 40.76-40.83 40.77-40.83 99Q140-422 180.83-381q40.84 41 99.17 41h170v60ZM325-450v-60h310v60H325Zm185 170v-60h170q58.33 0 99.17-40.76 40.83-40.77 40.83-99Q820-538 779.17-579q-40.84-41-99.17-41H510v-60h170q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H510Z" />
    </Icon>
  );
}

export function ArrowUpwardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M450-160v-526L202-438l-42-42 320-320 320 320-42 42-248-248v526h-60Z" />
    </Icon>
  );
}

/** Waiting on the other person */
export function HourglassIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M308-140h344v-127q0-72-50-121.5T480-438q-72 0-122 49.5T308-267v127Zm294-432q50-50 50-122v-126H308v126q0 72 50 122t122 50q72 0 122-50ZM160-80v-60h88v-127q0-71 40-129t106-84q-66-27-106-85t-40-129v-126h-88v-60h640v60h-88v126q0 71-40 129t-106 85q66 26 106 84t40 129v127h88v60H160Z" />
    </Icon>
  );
}
