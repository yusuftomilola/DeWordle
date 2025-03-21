import API from '@/utils/axios';
import { useMutation } from '@tanstack/react-query';

const URL = 'users';

export function useSignup() {
  return useMutation({
    mutationFn: (data) => API.post(`${URL}/create`, data),
    onSuccess: (res) => {
      window.alert(res?.data?.message);
    },
    onError: (error) => {
      console.error('Something went wrong', error);
    },
  });
}
