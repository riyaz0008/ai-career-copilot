import React, { useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Contact = () => {

  const nameref = useRef()
  const emailref = useRef()
  const messageref = useRef()
  

  const [error,seterror]=useState({})
    const Handlesubmit = (e) => {
      e.preventDefault()
      const name=nameref.current.value
      const email=emailref.current.value
      const message=messageref.current.value
  
      const newerror={}
      if (!name || name === "") {
        newerror.name="Name is required"
        
      }
      if (!email || email === "") {
        newerror.email="Email is required"
        
      }
      else if (!email.includes("@gmail.com")) {
        newerror.email="Please enter a valid email"
      }
      if (!message || message === "") {
        newerror.message="Message is required"
      }
      seterror(newerror)
      
      if(newerror.name) {
        nameref.current.focus()
        return
    }
      if(newerror.email) {
        emailref.current.focus()
        return
    }
      if(newerror.message) {
        messageref.current.focus()
        return
    }
    alert('Message sent successfully')
    console.log('Message sent successfully')
    e.target.reset()

  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">

      <Navbar />

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Contact Card */}
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            {/* Heading */}
            <div className="text-center">

              <h1 className="text-3xl font-black text-white tracking-tight">
                Contact Us
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                We're here to support your career journey.
              </p>

            </div>


            {/* Contact Form */}
            <form onSubmit={Handlesubmit} className="mt-8 space-y-5">

              {/* Name */}
              <div>

                <label
                  htmlFor="name"
                  className="block mb-2 text-left text-sm font-semibold text-slate-200"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  ref={nameref}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                />
              {error.name && (<p className="text-rose-400 text-xs mt-1 font-medium">
              {error.name}</p>)}

              </div>


              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="block mb-2 text-left text-sm font-semibold text-slate-200"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  ref={emailref}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                />
              {error.email && (<p className="text-rose-400 text-xs mt-1 font-medium">
              {error.email}</p>)}

              </div>


              {/* Message */}
              <div>

                <label
                  htmlFor="message"
                  className="block mb-2 text-left text-sm font-semibold text-slate-200"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  rows="4"
                  ref={messageref}
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                ></textarea>
              {error.message && (<p className="text-rose-400 text-xs mt-1 font-medium">
              {error.message}</p>)}

              </div>


              {/* Send Button */}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-4 font-bold text-white transition shadow-lg shadow-indigo-600/30 transform hover:-translate-y-0.5"
              >
                Send Message
              </button>

            </form>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
};

export default Contact;