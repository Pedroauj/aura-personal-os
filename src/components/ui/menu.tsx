import * as React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/* ── Types ── */
export interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  isSeparator?: boolean;
}

export interface UserProfileSidebarProps {
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  navItems: NavItem[];
  logoutItem: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/* ── Animation variants ── */
const sidebarVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
};

/* ── Avatar ── */
function Avatar({
  avatarUrl,
  initials,
  name,
}: {
  avatarUrl?: string;
  initials: string;
  name: string;
}) {
  const [imgError, setImgError] = React.useState(false);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        onError={() => setImgError(true)}
        className="size-12 rounded-full object-cover ring-2 ring-white/15"
      />
    );
  }

  return (
    <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-primary/15 text-[15px] font-semibold text-primary ring-2 ring-primary/20">
      {initials}
    </div>
  );
}

/* ── Component ── */
export const UserProfileSidebar = React.forwardRef<
  HTMLElement,
  UserProfileSidebarProps
>(({ name, email, avatarUrl, initials, navItems, logoutItem, className }, ref) => {
  return (
    <motion.aside
      ref={ref as React.Ref<HTMLElement>}
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      aria-label="Menu do perfil"
      className={cn(
        "glass-elevated flex h-full w-full max-w-xs flex-col p-4",
        className,
      )}
    >
      {/* User header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3 p-2"
      >
        <Avatar avatarUrl={avatarUrl} initials={initials} name={name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{name}</p>
          <p className="truncate text-[12px] text-muted-foreground">{email}</p>
        </div>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={itemVariants}
        className="my-3 h-px bg-white/8"
      />

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5" role="navigation">
        {navItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.isSeparator && (
              <motion.div variants={itemVariants} className="h-3" />
            )}
            <motion.div variants={itemVariants}>
              <Link
                to={item.to}
                className="group flex items-center rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:bg-white/8 hover:text-foreground"
              >
                <span className="mr-3 flex size-5 shrink-0 items-center justify-center">
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60" />
              </Link>
            </motion.div>
          </React.Fragment>
        ))}
      </nav>

      {/* Logout */}
      <motion.div variants={itemVariants} className="mt-3">
        <div className="h-px bg-white/8 mb-3" />
        <button
          onClick={logoutItem.onClick}
          className="group flex w-full items-center rounded-xl px-3 py-2.5 text-[13px] font-medium text-destructive transition-all hover:bg-destructive/10"
        >
          <span className="mr-3 flex size-5 shrink-0 items-center justify-center">
            {logoutItem.icon}
          </span>
          <span>{logoutItem.label}</span>
        </button>
      </motion.div>
    </motion.aside>
  );
});

UserProfileSidebar.displayName = "UserProfileSidebar";
