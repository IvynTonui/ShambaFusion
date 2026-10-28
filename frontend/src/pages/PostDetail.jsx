import React, {useState,useEffect} from 'react';
import {useParams, Link, useNavigate} from 'react-router-dom';
import axios from '../utils/axios-config';
import PostItem from '../components/posts/Forum/PostItem';
export default function PostDetail() {
 const {id}=useParams(); const navigate=useNavigate(); const [post,setPost]=useState(null); const [error,setError]=useState('');
 useEffect(()=>{axios.get(`/posts/${id}`).then(r=>setPost(r.data)).catch(e=>setError(e.response?.data?.message || 'Unable to load discussion'));},[id]);
 return <section className="p-6 space-y-5"><Link to="/forum">← All discussions</Link>{error ? <p role="alert">{error}</p> : post ? <PostItem {...post} id={post.post_id} author={post.author_name} time={post.created_at} onPostUpdated={(_,data)=>setPost({...post,...data})} onPostDeleted={()=>navigate('/forum')} /> : <p>Loading discussion…</p>}</section>;
}
