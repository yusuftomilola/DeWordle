import API from '@/utils/axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from "react-toastify";

const URL = 'auth';

export function useSignin() {
  return useMutation({
    mutationFn: (data) => API.post(`${URL}/sign-in`, data),
    onSuccess: (res) => {
      localStorage.setItem('currentUser', res.data);
      toast.success("Sign In Successfully");
    },
    onError: (error) => {
      console.error('Something went wrong', error);
      toast.error(error?.response?.data?.message);
    },
  });
}
