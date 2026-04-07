import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";



import img1 from "../../images/img1.jpg";
import img2 from "../../images/img2.jpg";
import img3 from "../../images/img3.jpg";
import img4 from "../../images/img4.jpg";
import video1 from "../../images/video1.mp4";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const DashboardCard = ({ icon: Icon, title, value, trend }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
                <Icon size={24} className="text-green-600" />
            </div>
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '+' : ''}{trend}%
            </span>
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
);

const Dashboard = ({ user }) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-gray-50">
            <div className="w-full max-w-screen-xl mx-auto p-4 md:p-6 space-y-6">
                {/* Hero Video Banner */}
                <div className="relative w-full h-64 rounded-lg shadow-lg overflow-hidden">
                    <video
                        src={video1}
                        autoPlay
                        loop
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center px-4 lg:px-10">
                        <h2 className="text-white text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold leading-snug">
                            Empowering Farmers Through Connection & Collaboration
                        </h2>
                    </div>
                </div>

                {/* Welcome Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            {user ? `Welcome back, ${user.name}!` : 'Welcome to Shamba Fusion!'}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Connecting farmers for better communication and collaboration
                        </p>
                    </div>
                    {user && (
                        <button
                            onClick={() => navigate("/newPost", { state: { createForm: true } })}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            + New Discussion
                        </button>
                    )}
                </div>

                {/* Alert for Non-Logged-In Users */}
                {!user ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-yellow-800 mb-3">
                            🌱 Join the Shamba Fusion Community
                        </h3>
                        <p className="text-yellow-700 mb-4">
                            Connect with other farmers and share valuable insights.
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <li className="flex items-center gap-2 text-yellow-700">
                                <Users size={20} /> Network with farmers
                            </li>
                            <li className="flex items-center gap-2 text-yellow-700">
                                <Sprout size={20} /> Share best practices
                            </li>
                        </ul>
                        <div className="flex gap-4">
                            <Link to="/register"
                                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                Get Started
                            </Link>
                            <Link to="/login"
                                  className="bg-white text-green-600 px-6 py-2 rounded-lg border border-green-600 hover:bg-green-50 transition-colors">
                                Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DashboardCard
                            icon={Users}
                            title="Active Discussions"
                            value="10"
                            trend={15.2}
                        />
                        <DashboardCard
                            icon={Sprout}
                            title="Resources Available"
                            value="25"
                            trend={8.5}
                        />
                    </div>
                )}

                {/* Photo Carousel */}
                <div className="mt-6 w-full">
                    <Swiper
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        pagination={{
                            clickable: true,
                            el: '.swiper-pagination',
                            type: 'bullets',
                        }}
                        modules={[Navigation, Pagination]}
                        className="rounded-lg shadow-lg relative">
                        <SwiperSlide>
                            <div className="aspect-w-16 aspect-h-9 w-full">
                                <img
                                    src={img1}
                                    alt="Farmers Group Discussion"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className="aspect-w-16 aspect-h-9 w-full">
                                <img
                                    src={img2}
                                    alt="Farmers in Field"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className="aspect-w-16 aspect-h-9 w-full">
                                <img
                                    src={img3}
                                    alt="Community Meeting"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className="aspect-w-16 aspect-h-9 w-full">
                                <img
                                    src={img4}
                                    alt="Sustainable Farming Techniques"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </SwiperSlide>

                        <div
                            className="swiper-button-prev absolute left-4 top-1/2 z-10 bg-white bg-opacity-70 rounded-full p-3 cursor-pointer shadow-md transform -translate-y-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="text-green-600">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </div>
                        <div
                            className="swiper-button-next absolute right-4 top-1/2 z-10 bg-white bg-opacity-70 rounded-full p-3 cursor-pointer shadow-md transform -translate-y-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="text-green-600">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </div>

                        <div className="swiper-pagination bottom-4 !static mt-4"></div>
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
