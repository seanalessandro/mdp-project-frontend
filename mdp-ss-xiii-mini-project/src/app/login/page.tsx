"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import PaperIcon from "../../components/PaperIcon";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempted with:", { username, password });

        if (username && password) {
            window.location.href = "/dashboard";
        } else {
            Modal.info({
                title: 'Peringatan',
                content: 'Mohon masukkan username dan password.',
            });
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your username"
                        required
                    />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Login
                </button>
            </form>
        </div>
    );
}