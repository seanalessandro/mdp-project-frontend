"use client";

import React, { useState } from "react";
import { Modal, Spin } from "antd";
import { useRouter } from "next/navigation";
import PaperIcon from "../../components/PaperIcon";
import { apiService } from "../../utils/api";
import { AuthManager, validateUsername, validatePassword } from "../../utils/auth";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{username?: string, password?: string}>({});
    const router = useRouter();

    const validateForm = (): boolean => {
        const newErrors: {username?: string, password?: string} = {};
        
        const usernameError = validateUsername(username);
        if (usernameError) newErrors.username = usernameError;
        
        if (!password) newErrors.password = 'Password is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const response = await apiService.login({ username, password });
            AuthManager.setAuth(response.token, response.user);
            
            // Route based on user role
            switch (response.user.role) {
                case 'admin':
                    router.push('/dashboard');
                    break;
                case 'manager':
                    router.push('/dashboard');
                    break;
                case 'user':
                default:
                    router.push('/dashboard');
                    break;
            }
        } catch (error) {
            Modal.error({
                title: 'Login Failed',
                content: error instanceof Error ? error.message : 'An error occurred during login',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-center mb-6">
                <PaperIcon className="w-16 h-16 text-blue-500" />
            </div>

            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Selamat datang di Project MDP SS XII
                </h1>
                <p className="text-gray-500 text-sm">
                    Aplikasi Business Requirement Document
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.username ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your username"
                        disabled={loading}
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your password"
                        disabled={loading}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                >
                    {loading ? <Spin size="small" className="mr-2" /> : null}
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Test Credentials:</p>
                <p className="text-xs text-gray-500">Admin: admin / password123!</p>
                <p className="text-xs text-gray-500">Manager: manager / password123!</p>
                <p className="text-xs text-gray-500">User: user / password123!</p>
            </div>
        </div>
    );
}