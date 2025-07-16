import React from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import { Link, useNavigate } from 'react-router';
import SocialLogin from '../SocialLogin/SocialLogin';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useImageUploader from '../../../hooks/useImageUploader';
import useAxios from '../../../hooks/useAxios';

const Register = () => {
  const axiosInstance = useAxios();
  const { createUser, setLoading, updateUser, loading } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { upload, uploading } = useImageUploader();
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = React.useState(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const password = watch('password', '');
  const [passwordValidation, setPasswordValidation] = React.useState({
    hasNumber: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasSpecialChar: false,
    isLongEnough: false,
  });

  // Password validation check
  React.useEffect(() => {
    setPasswordValidation({
      hasNumber: /\d/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasSpecialChar: /[^\w\s]/.test(password),
      isLongEnough: password.length >= 6,
    });
  }, [password]);

  const validatePassword = (pwd) => {
    return (
      /\d/.test(pwd) &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[^\w\s]/.test(pwd) &&
      pwd.length >= 6
    ) || "Password does not meet complexity requirements";
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const imageFile = data.photo[0];
      const imageURL = await upload(imageFile);

      await createUser(data.email, data.password);
      await updateUser({
        displayName: data.name,
        photoURL: imageURL,
      });

      // Save to DB
      const userInfo = {
        name: data.name,
        email: data.email,
        photo: imageURL,
        badge: 'Bronze',
        role: 'user',
      };
      await axiosInstance.post('/users', userInfo);

      Swal.fire({
        title: "Registration Successful!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      Swal.fire({
        title: "Registration Failed!",
        icon: "error",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='card bg-base-200 w-full max-w-sm shrink-0 shadow-2xl p-8'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="fieldset">
          <h1 className='text-4xl font-bold text-center pb-5'>Register Now!</h1>

          <label className="label">Your Name</label>
          <input
            type="text"
            {...register('name', { required: "Name is required" })}
            className="input"
            placeholder="Your Name"
          />
          {errors.name && <p className='text-red-500'>{errors.name.message}</p>}

          <label className="label">Your Photo</label>
          <input
            type="file"
            accept="image/*"
            {...register('photo', { required: "Profile picture is required" })}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setPreviewImage(URL.createObjectURL(file));
              }
            }}
            className="file-input file-input-bordered w-full"
          />
          {errors.photo && <p className='text-red-500'>{errors.photo.message}</p>}
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-24 h-24 rounded-full mt-2 object-cover"
            />
          )}

          <label className="label">Email</label>
          <input
            type="email"
            {...register('email', { required: "Email is required" })}
            className="input"
            placeholder="Email"
          />
          {errors.email && <p className='text-red-500'>{errors.email.message}</p>}

          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register('password', {
                required: "Password is required",
                validate: validatePassword
              })}
              className="input pr-10"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <p className='text-red-500'>{errors.password.message}</p>}

          <div className="mt-2 text-sm">
            <p className={passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}>• At least one number</p>
            <p className={passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'}>• At least one uppercase letter</p>
            <p className={passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-600'}>• At least one lowercase letter</p>
            <p className={passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}>• At least one special character</p>
            <p className={passwordValidation.isLongEnough ? 'text-green-600' : 'text-red-600'}>• Minimum 6 characters</p>
          </div>
        </fieldset>

        <button type="submit" className="btn btn-neutral mt-4" disabled={loading || uploading}>
          {loading || uploading ? "Registering..." : "Register"}
        </button>

        <p className='text-xs py-5'>
          Already have an account?{" "}
          <Link to="/login" className="text-red-400 hover:underline">Login</Link>
        </p>
      </form>

      <SocialLogin />
    </div>
  );
};

export default Register;
