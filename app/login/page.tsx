'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Home } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const result = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-white">
      <Link 
        href="/" 
        className="fixed top-4 left-4 p-2 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
      >
        <Home className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email" 
                type="email" 
                placeholder="Enter your email" 
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                name="password" 
                type="password" 
                placeholder="Enter your password" 
                required 
                className="w-full"
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a]">
              Sign In
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-[#008080] hover:text-[#006666] font-medium hover:underline"
              >
                Register here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 