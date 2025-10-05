import type {FormEvent} from "react";
import {useState} from 'react';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';
import {Alert, AlertDescription} from './ui/alert';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './ui/tabs';
import type {LoginRequest, RegisterRequest} from '../types/auth';

interface LoginProps {
    onLogin: (data: LoginRequest) => Promise<void>;
    onRegister: (data: RegisterRequest) => Promise<void>;
    error: string | null;
    isLoading: boolean;
}

export function Login({onLogin, onRegister, error, isLoading}: LoginProps) {
    const [loginData, setLoginData] = useState<LoginRequest>({
        email: '',
        password: '',
    });

    const [registerData, setRegisterData] = useState<RegisterRequest>({
        name: '',
        email: '',
        password: '',
    });

    const handleLoginSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onLogin(loginData);
    };

    const handleRegisterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onRegister(registerData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Live Support Dashboard</CardTitle>
                    <CardDescription>Sign in to manage support tickets</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="agent@example.com"
                                        value={loginData.email}
                                        onChange={(e) =>
                                            setLoginData({...loginData, email: e.target.value})
                                        }
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        value={loginData.password}
                                        onChange={(e) =>
                                            setLoginData({...loginData, password: e.target.value})
                                        }
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-name">Name</Label>
                                    <Input
                                        id="register-name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={registerData.name}
                                        onChange={(e) =>
                                            setRegisterData({...registerData, name: e.target.value})
                                        }
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email</Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="agent@example.com"
                                        value={registerData.email}
                                        onChange={(e) =>
                                            setRegisterData({...registerData, email: e.target.value})
                                        }
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Password</Label>
                                    <Input
                                        id="register-password"
                                        type="password"
                                        placeholder="Minimum 6 characters"
                                        value={registerData.password}
                                        onChange={(e) =>
                                            setRegisterData({...registerData, password: e.target.value})
                                        }
                                        required
                                        minLength={6}
                                        disabled={isLoading}
                                    />
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

