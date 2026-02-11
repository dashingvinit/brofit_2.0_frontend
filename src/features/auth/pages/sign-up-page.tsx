import { SignUp } from '@clerk/clerk-react';
import { ROUTES } from '@/shared/lib/constants';

export function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        routing="path"
        path={ROUTES.SIGN_UP}
        signInUrl={ROUTES.SIGN_IN}
        afterSignUpUrl={ROUTES.DASHBOARD}
      />
    </div>
  );
}
