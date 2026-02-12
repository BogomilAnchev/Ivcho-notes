import styles from "@/features/common/Button/Button.module.scss";

type ButtonProps = {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button className={styles.btn} {...props}>
      {children}
    </button>
  );
};
