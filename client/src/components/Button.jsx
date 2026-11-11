import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  isLoading = false,
  ...props
}) => {
  const cls = variant === "primary" ? "btn-primary" : "btn-ghost";
  return (
    <motion.button
      whileHover={props.disabled || isLoading ? undefined : { scale: 1.015 }}
      whileTap={props.disabled || isLoading ? undefined : { scale: 0.985 }}
      className={cls}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Please wait…</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
