import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { runFirebaseTests } from '@/utils/firebaseTest';
import { runComprehensiveFirebaseTests } from '@/utils/firebaseConnectionTest';
import { runSupabaseTests } from '@/utils/supabaseTest';

export const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();

  const handleEmailAuth = async (mode: 'signin' | 'signup') => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = mode === 'signin' 
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else if (mode === 'signup') {
      toast({
        title: "Success",
        description: "Check your email for confirmation link",
      });
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Test Firebase connection - this function helps diagnose Firebase configuration issues
  const handleTestFirebase = async () => {
    setLoading(true);
    try {
      // Run comprehensive tests first
      const comprehensiveResults = await runComprehensiveFirebaseTests();
      console.log('Comprehensive test results:', comprehensiveResults);
      
      // Then run the original tests
      const results = await runFirebaseTests();
      console.log('Original test results:', results);
      
      if (comprehensiveResults.overall && results.overall) {
        toast({
          title: "✅ Firebase Test Passed",
          description: `Project: ${comprehensiveResults.configuration.projectId} | Auth: ✅ | Firestore: ✅`,
        });
      } else {
        const authStatus = results.auth?.success ? '✅' : '❌';
        const firestoreStatus = results.firestore?.success ? '✅' : '❌';
        const initStatus = comprehensiveResults.initialization?.success ? '✅' : '❌';
        
        toast({
          title: "❌ Firebase Test Failed",
          description: `Init: ${initStatus} | Auth: ${authStatus} | Firestore: ${firestoreStatus}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Firebase test error:', error);
      toast({
        title: "Firebase Test Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Test Supabase connection - this function helps diagnose Supabase configuration issues
  const handleTestSupabase = async () => {
    setLoading(true);
    try {
      const results = await runSupabaseTests(user?.uid);
      console.log('Supabase test results:', results);
      
      if (results.overall) {
        toast({
          title: "✅ Supabase Test Passed",
          description: `Connection: ✅ | Auth: ✅ | Tasks: ${results.tasks.success ? '✅' : '❌'}`,
        });
      } else {
        const connectionStatus = results.connection.success ? '✅' : '❌';
        const authStatus = results.auth.success ? '✅' : '❌';
        const taskStatus = results.tasks.success ? '✅' : '❌';
        
        toast({
          title: "❌ Supabase Test Failed",
          description: `Connection: ${connectionStatus} | Auth: ${authStatus} | Tasks: ${taskStatus}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Supabase test error:', error);
      toast({
        title: "Supabase Test Error",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-card border border-border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Focus Timer</CardTitle>
          <CardDescription>
            Sign in to track your tasks and productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <Button 
                onClick={() => handleEmailAuth('signin')} 
                className="w-full"
                disabled={loading}
              >
                Sign In
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password"
                />
              </div>
              <Button 
                onClick={() => handleEmailAuth('signup')} 
                className="w-full"
                disabled={loading}
              >
                Sign Up
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleGoogleAuth}
              className="w-full mt-4"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
            
            {/* Firebase Test Button - helps diagnose connection issues */}
            <Button 
              variant="secondary" 
              onClick={handleTestFirebase}
              className="w-full mt-2"
              disabled={loading}
            >
              🔧 Test Firebase Connection
            </Button>
            
            {/* Supabase Test Button - helps diagnose database connection issues */}
            <Button 
              variant="secondary" 
              onClick={handleTestSupabase}
              className="w-full mt-2"
              disabled={loading}
            >
              🗄️ Test Supabase Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};