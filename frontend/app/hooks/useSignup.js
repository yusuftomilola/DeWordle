import API from '@/utils/axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from "react-toastify";

const URL = 'users';

export function useSignup() {
  return useMutation({
    mutationFn: (data) => API.post(`${URL}/create`, data),
    onSuccess: (res) => {
      toast.success(res?.data?.message);
    },
    onError: (error) => {
      console.error('Something went wrong', error);
      toast.error(error?.response?.data?.message);
    },
  });
}
