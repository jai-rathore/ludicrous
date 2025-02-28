'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import CreateBattingOrder from '../../components/CreateBattingOrder';
import ProtectedRoute from '../../components/ProtectedRoute';

function CreateOrderContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit') || undefined;

  // Only check for existing order if not in edit mode
  useEffect(() => {
    if (!loading && user && !editId) {
      const checkExistingOrder = async () => {
        try {
          const response = await fetch('/api/batting-orders');
          if (response.ok) {
            const data = await response.json();
            const userHasOrder = data.battingOrders?.some(
              (order: any) => order.userId === user.uid
            );
            
            if (userHasOrder) {
              // Redirect to home if user already has an order and not in edit mode
              router.push('/');
            }
          }
        } catch (error) {
          console.error('Error checking existing order:', error);
        }
      };
      
      checkExistingOrder();
    }
  }, [user, loading, router, editId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <CreateBattingOrder editId={editId} />
      </div>
    </ProtectedRoute>
  );
}

export default function CreateOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-black">Loading...</p>
          </div>
        </div>
      }
    >
      <CreateOrderContent />
    </Suspense>
  );
}