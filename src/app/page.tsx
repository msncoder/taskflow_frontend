import { redirect } from 'next/navigation';

export default function Home() {
  // Directly redirect visitors to the login page for now. 
  // In a full app, we might check for tokens here or in middleware.
  redirect('/login');
}
