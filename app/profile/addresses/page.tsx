"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check } from "lucide-react";
import AddressForm from "@/components/profile/address-form";

interface SavedAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddressDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setAddresses(addresses.filter((addr) => addr.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (response.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    fetchAddresses();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Saved Addresses</h1>
        <p className="text-gray-600 mt-2">
          Manage your delivery addresses for faster checkout
        </p>
      </div>

      {!showForm && !editingId ? (
        <>
          {addresses.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-6">No saved addresses yet</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent-blue text-white hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Address
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Address
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow">
                    {address.isDefault && (
                      <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Default
                      </div>
                    )}

                    <div className="space-y-3 pr-20">
                      <div>
                        <p className="text-sm font-semibold text-gray-500">
                          {address.label}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {address.firstName} {address.lastName}
                        </p>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{address.address}</p>
                        <p>
                          {address.city}, {address.state}
                        </p>
                        <p>{address.phone}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => setEditingId(address.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1">
                        Edit
                      </Button>
                      {!address.isDefault && (
                        <Button
                          onClick={() => handleSetDefault(address.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1">
                          Set Default
                        </Button>
                      )}
                      <button
                        onClick={() => handleAddressDelete(address.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <AddressForm
          addressId={editingId}
          onClose={handleFormClose}
          existingAddresses={addresses}
        />
      )}
    </div>
  );
}
