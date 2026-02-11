import { SignIn } from '@clerk/clerk-react';
import { ROUTES } from '@/shared/lib/constants';

export function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        routing="path"
        path={ROUTES.SIGN_IN}
        signUpUrl={ROUTES.SIGN_UP}
        afterSignInUrl={ROUTES.DASHBOARD}
      />
    </div>
  );
}
