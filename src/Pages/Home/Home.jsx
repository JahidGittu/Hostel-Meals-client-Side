import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Banner from '../HomeComponents/Banner/Banner';
import MembershipPage from '../MembershipPage/MembershipPage';
import PopularMeals from '../HomeComponents/PopularMeals/PopularMeals';
import TestimonialsSection from '../HomeComponents/Testimonials/Testimonials';
import FaqSection from '../HomeComponents/FaqSection/FaqSection';
import CategoryTabs from '../HomeComponents/CategoryTabs/CategoryTabs';
import useAxios from '../../hooks/useAxios';
import useSecureAxios from '../../hooks/useSecureAxios';
import Loading from '../Shared/Loading/Loading';

const Home = () => {
  const secureAxios = useSecureAxios();
  const axiosInstance = useAxios();

  // Get current user
  const { data: currentUser, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await secureAxios.get('/current-user');
      return res.data;
    },
  });

  // Get popular meals
  const { data: popularMeals = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['popularMeals'],
    queryFn: async () => {
      const res = await axiosInstance.get('/meals-popular');
      return res.data;
    },
  });

  // Get featured reviews
  const { data: featuredReviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['featuredReviews'],
    queryFn: async () => {
      const res = await axiosInstance.get('/reviews-featured');
      return res.data;
    },
  });

  console.log("featured revies here", featuredReviews)

  // Get FAQs
  const { data: faqs = [], isLoading: loadingFaqs } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await axiosInstance.get('/faqs');
      return res.data;
    },
  });

  const isLoading = loadingUser || loadingMeals || loadingReviews || loadingFaqs;

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-12">
      <Banner />
      <CategoryTabs />
      <MembershipPage currentUser={currentUser} />
      <PopularMeals meals={popularMeals} />
      <TestimonialsSection featuredReviews={featuredReviews} />
      {/* <FaqSection faqs={faqs} /> */}
    </div>
  );
};

export default Home;
