'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          name: formData.get('name'),
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (res.ok) {
        router.push('/login')
      } else {
        setError('Registration failed')
      }
    } catch (error) {
      setError('Something went wrong')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name"
                name="name" 
                type="text" 
                placeholder="Enter your name" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email" 
                type="email" 
                placeholder="Enter your email" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                name="password" 
                type="password" 
                placeholder="Create a password" 
                required 
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full">
              Register
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 