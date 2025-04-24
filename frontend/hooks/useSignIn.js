import { AppContext } from '@/context/AppContext';
import API from '@/utils/axios';
import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { toast } from "react-toastify";

const URL = 'auth';


export function useSignin() {

  // const context = useContext(AppContext);

  // if (!context) {
  //   console.log('useSignin must be used within an AppProvider');
  // }
  // const { setUserData } = context || {};
  return useMutation({
    mutationFn: (data) => API.post(`${URL}/sign-in`, data),
    onSuccess: (res) => {
      // setUserData(res.data[1]);
      const userData = res.data[1];
      localStorage.setItem('authToken', res.data[0].token);

      localStorage.setItem('currentUser', JSON.stringify(userData));
      console.log('Sign In Successfully', res);
      toast.success("Sign In Successfully");
    },
    onError: (error) => {
      console.error('Something went wrong', error);
      toast.error(error?.response?.data?.message);
    },
  });
}
