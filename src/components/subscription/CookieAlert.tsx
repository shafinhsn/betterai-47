
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CookieIcon } from "lucide-react"

interface CookieAlertProps {
  onOpenSettings: () => void;
}

export const CookieAlert = ({ onOpenSettings }: CookieAlertProps) => {
  return (
    <Alert>
      <CookieIcon className="h-4 w-4" />
      <AlertTitle>Cookies Required</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>PayPal requires third-party cookies to be enabled for the subscription process.</p>
        <Button 
          variant="outline" 
          onClick={onOpenSettings}
          className="w-fit"
        >
          Open Cookie Settings
        </Button>
      </AlertDescription>
    </Alert>
  )
}

