import Turnstile, { useTurnstile } from "react-turnstile";

export function TurnstileWidget() {
  const turnstile = useTurnstile();
  return (
    <Turnstile
      sitekey="0x4AAAAAABcva8kH45Bm2f67"
      onVerify={(token) => {
        fetch("http://localhost:5000/verify", {
          method: "POST",
          body: JSON.stringify({ token }),
        }).then((response) => {
          if (!response.ok) turnstile.reset();
        });
      }}
    />
  );
}