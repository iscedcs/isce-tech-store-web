"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Palette,
  Plus,
  Star,
  Truck,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

import {
  createSavedAddress,
  getSavedAddresses,
  SavedAddress,
} from "@/actions/address";
import { submitCheckout } from "@/actions/checkout";
import { LocationSearch } from "@/components/checkout/location-search";
import { PickupLocations } from "@/components/checkout/pickup-locations";
import { ShippingCostDisplay } from "@/components/checkout/shipping-cost-display";
import { checkoutFormSchema, CheckoutFormValues } from "@/lib/schemas";
import { useCartStore } from "@/lib/store/cart-store";
import {
  GIGHomeDeliveryArea,
  GIGPickupLocation,
  GIGStation,
} from "@/lib/types/gig-logistics";
import { calculateVAT, formatCurrency, paymentMethods } from "@/lib/utils";
import { getStateIdByName } from "@/lib/utils/state-mapping";

function CheckoutPageContent() {
  const { items, clearCart, getSubtotal, getCustomizationFees } =
    useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Address management state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // GIG Logistics location state
  const [selectedStation, setSelectedStation] = useState<GIGStation | null>(
    null,
  );
  const [selectedPickupLocation, setSelectedPickupLocation] =
    useState<GIGPickupLocation | null>(null);
  const [selectedDeliveryArea, setSelectedDeliveryArea] =
    useState<GIGHomeDeliveryArea | null>(null);
  const [calculatedShippingCost, setCalculatedShippingCost] = useState<
    number | null
  >(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: session?.user?.firstName || "",
      lastName: session?.user?.lastName || "",
      email: session?.user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      deliveryMethod: "pickup",
      pickupLocation: "",
      stationId: undefined,
      areaId: undefined,
      latitude: undefined,
      longitude: undefined,
      paymentMethod: "paystack",
    },
    mode: "all",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
    } else if (status === "authenticated" && items.length === 0) {
      router.push("/products");
    }
  }, [status, items.length, router]);

  // Fetch saved addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      if (status !== "authenticated") return;
      setLoadingAddresses(true);
      const result = await getSavedAddresses();
      if (result.success && result.data) {
        setSavedAddresses(result.data);
        // Auto-select default address
        const defaultAddr = result.data.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          fillFormWithAddress(defaultAddr);
        } else if (result.data.length > 0) {
          setSelectedAddressId(result.data[0].id);
          fillFormWithAddress(result.data[0]);
        } else {
          setShowNewAddressForm(true);
        }
      } else {
        setShowNewAddressForm(true);
      }
      setLoadingAddresses(false);
    };
    fetchAddresses();
  }, [status]);

  // Fill form from session user data
  useEffect(() => {
    if (session?.user) {
      form.setValue("firstName", session.user.firstName || "");
      form.setValue("lastName", session.user.lastName || "");
      form.setValue("email", session.user.email || "");
    }
  }, [session, form]);

  // Helper to fill form with saved address data
  const fillFormWithAddress = (address: SavedAddress) => {
    form.setValue("firstName", address.firstName);
    form.setValue("lastName", address.lastName);
    form.setValue("phone", address.phone);
    form.setValue("address", address.address);
    form.setValue("city", address.city);
    form.setValue("state", address.state);
    if (address.latitude) form.setValue("latitude", address.latitude);
    if (address.longitude) form.setValue("longitude", address.longitude);
  };

  // Handle address selection change
  const handleAddressSelect = (addressId: string) => {
    if (addressId === "new") {
      setSelectedAddressId(null);
      setShowNewAddressForm(true);
      // Clear address fields but keep email from session
      form.setValue("firstName", session?.user?.firstName || "");
      form.setValue("lastName", session?.user?.lastName || "");
      form.setValue("phone", "");
      form.setValue("address", "");
      form.setValue("city", "");
      form.setValue("state", "");
    } else {
      const selected = savedAddresses.find((a) => a.id === addressId);
      if (selected) {
        setSelectedAddressId(addressId);
        setShowNewAddressForm(false);
        setSaveNewAddress(false);
        fillFormWithAddress(selected);
      }
    }
  };

  if (status === "loading") {
    return (
      <MaxWidthWrapper className="py-20 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </MaxWidthWrapper>
    );
  }

  if (!session) {
    return null;
  }

  // Calculate all fees
  // Home delivery price comes from GIG API; pickup has a flat ₦750 fee
  const PICKUP_STATION_FEE = 750;
  const deliveryPrice =
    form.watch("deliveryMethod") === "home-delivery"
      ? (calculatedShippingCost ?? 0)
      : PICKUP_STATION_FEE;
  const baseSubtotal = getSubtotal();
  const customizationFees = getCustomizationFees();
  const totalWithCustomization = baseSubtotal + customizationFees;
  const vatAmount = calculateVAT(totalWithCustomization);
  const totalPrice = totalWithCustomization + deliveryPrice + vatAmount;

  const handleSelectChange = (
    name: keyof CheckoutFormValues,
    value: string,
  ) => {
    form.setValue(name, value as never);
    if (name === "deliveryMethod") {
      if (value !== "pickup") {
        form.setValue("pickupLocation", "");
      }
      // Reset calculated cost when changing delivery method
      if (value !== "home-delivery") {
        setCalculatedShippingCost(null);
      }
    }
    form.trigger(name);
  };

  type FieldName = keyof CheckoutFormValues;
  const fieldsToValidate: Record<number, FieldName[]> = {
    1: ["firstName", "lastName", "email", "phone"],
    2: ["deliveryMethod"],
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentFields = fieldsToValidate[step as 1 | 2];
    if (currentFields) {
      const isValid = await form.trigger(currentFields);
      if (isValid) {
        setStep(step + 1);
      } else {
        // Get all field errors for this step
        const errors = form.formState.errors;
        const missingFields = currentFields.filter((field) => errors[field]);
        const fieldLabels: Record<string, string> = {
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email",
          phone: "Phone",
          deliveryMethod: "Delivery Method",
        };

        const fieldNames = missingFields
          .map((field) => fieldLabels[field] || field)
          .join(", ");

        toast.error(`Please fill in: ${fieldNames}`, {
          description:
            "All required fields must be completed before continuing.",
        });
      }
    } else {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (step !== 3) {
      console.log(
        "[Checkout] Not on step 3, skipping submission. Current step:",
        step,
      );
      return;
    }

    // Check session
    if (!session || !session.user) {
      const errorMsg = "You must be logged in to complete your order";
      setError(errorMsg);
      toast.error(errorMsg);
      router.push("/auth/signin");
      return;
    }

    console.log("[Checkout] Form data:", data);
    console.log("[Checkout] Cart items:", items);

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate all required fields before submission
      const allFieldsToValidate: FieldName[] = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "deliveryMethod",
      ];

      const isFormValid = await form.trigger(allFieldsToValidate);

      if (!isFormValid) {
        const errors = form.formState.errors;
        const missingFields = allFieldsToValidate.filter(
          (field) => errors[field],
        );
        const fieldLabels: Record<string, string> = {
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email",
          phone: "Phone",
          deliveryMethod: "Delivery Method",
        };

        const fieldNames = missingFields
          .map((field) => fieldLabels[field] || field)
          .join(", ");

        toast.error(`Missing required fields: ${fieldNames}`, {
          description: "Please go back and fill in all required fields.",
        });
        setIsSubmitting(false);
        // Go back to Step 1 if there are contact info errors
        if (
          missingFields.some((f) =>
            ["firstName", "lastName", "email", "phone"].includes(f),
          )
        ) {
          setStep(1);
        }
        return;
      }

      // Save new address if checkbox is checked
      if (saveNewAddress && showNewAddressForm && newAddressLabel.trim()) {
        const saveResult = await createSavedAddress({
          label: newAddressLabel.trim(),
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          latitude: data.latitude,
          longitude: data.longitude,
          isDefault: savedAddresses.length === 0, // Make default if first address
        });
        if (!saveResult.success) {
          console.warn("Failed to save address:", saveResult.error);
          // Don't block checkout, just log warning
        }
      }

      const cartItems = items.map((item) => ({
        id: item.id,
        slug: item.slug,
        name: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        customization: item.customization
          ? {
              customizationFee: item.customization.customizationFee || 0,
              designServiceFee: item.customization.designServiceFee || 0,
              cardColor: item.selectedColor || null,
              frontDesignUrl: item.customization.frontDesign || null,
              backDesignUrl: item.customization.backDesign || null,
            }
          : undefined,
      }));

      const result = await submitCheckout({
        formData: data,
        cartItems,
        deliveryPrice,
      });

      if (result.success && result.authorization_url) {
        toast.success("Redirecting to Paystack for payment...");
        clearCart();
        window.location.href = result.authorization_url;
      } else {
        setError(result.message || "Failed to process checkout");
        toast.error(result.message || "Failed to process checkout");
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Checkout error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MaxWidthWrapper className="py-8 sm:py-12 lg:pt-20 text-white min-h-screen">
      <motion.h1
        className="text-2xl sm:text-3xl font-bold my-4 sm:my-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}>
        Checkout
      </motion.h1>

      {error && (
        <Alert variant="destructive" className="mb-3 sm:mb-4 md:mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          const errorMessages: string[] = [];
          const fieldLabels: Record<string, string> = {
            firstName: "First Name",
            lastName: "Last Name",
            email: "Email",
            phone: "Phone",
            address: "Delivery Address",
            city: "City",
            state: "State",
            deliveryMethod: "Delivery Method",
            stationId: "Pickup Station",
            paymentMethod: "Payment Method",
          };
          Object.entries(errors).forEach(([key, err]) => {
            if (err?.message) {
              errorMessages.push(err.message as string);
            } else {
              errorMessages.push(`${fieldLabels[key] || key} is required`);
            }
          });
          if (errorMessages.length > 0) {
            toast.error("Please fix the following issues:", {
              description: errorMessages.join(". "),
            });
          }
        })}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}>
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="mr-2 h-5 w-5" />
                        Shipping Information
                      </CardTitle>
                      <CardDescription>
                        {savedAddresses.length > 0
                          ? "Select a saved address or enter a new one"
                          : "Enter your shipping details"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Contact Information - Always Visible */}
                      <div>
                        <h3 className="text-sm font-semibold mb-4">
                          Contact Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              placeholder="Enter your first name"
                              {...form.register("firstName")}
                            />
                            {form.formState.errors.firstName && (
                              <p className="text-sm text-red-500">
                                {form.formState.errors.firstName.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              placeholder="Enter your last name"
                              {...form.register("lastName")}
                            />
                            {form.formState.errors.lastName && (
                              <p className="text-sm text-red-500">
                                {form.formState.errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="your.email@example.com"
                              {...form.register("email")}
                            />
                            {form.formState.errors.email && (
                              <p className="text-sm text-red-500">
                                {form.formState.errors.email.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              placeholder="+234 800 000 0000"
                              {...form.register("phone")}
                            />
                            {form.formState.errors.phone && (
                              <p className="text-sm text-red-500">
                                {form.formState.errors.phone.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Saved Addresses Selector */}
                      {loadingAddresses ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">
                            Loading addresses...
                          </span>
                        </div>
                      ) : (
                        savedAddresses.length > 0 && (
                          <div className="space-y-3">
                            <Label>Saved Addresses</Label>
                            <div className="grid gap-2">
                              {savedAddresses.map((addr) => (
                                <div
                                  key={addr.id}
                                  onClick={() => handleAddressSelect(addr.id)}
                                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                    selectedAddressId === addr.id &&
                                    !showNewAddressForm
                                      ? "border-accent-blue bg-accent-blue/10"
                                      : "border-border hover:border-muted-foreground"
                                  }`}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                      {selectedAddressId === addr.id &&
                                        !showNewAddressForm && (
                                          <Check className="h-4 w-4 text-accent-blue" />
                                        )}
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {addr.label}
                                          </span>
                                          {addr.isDefault && (
                                            <span className="inline-flex items-center gap-1 text-xs bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded">
                                              <Star className="h-3 w-3" />{" "}
                                              Default
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {addr.firstName} {addr.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {addr.address}, {addr.city},{" "}
                                          {addr.state}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Add New Address Option */}
                              <div
                                onClick={() => handleAddressSelect("new")}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  showNewAddressForm
                                    ? "border-accent-blue bg-accent-blue/10"
                                    : "border-dashed border-border hover:border-muted-foreground"
                                }`}>
                                <div className="flex items-center gap-2">
                                  <Plus
                                    className={`h-4 w-4 ${showNewAddressForm ? "text-accent-blue" : ""}`}
                                  />
                                  <span
                                    className={
                                      showNewAddressForm
                                        ? "text-accent-blue font-medium"
                                        : ""
                                    }>
                                    Use a different address
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="ml-auto text-foreground cursor-pointer">
                        Continue to Delivery
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Delivery Method */}
              {step === 2 && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}>
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Truck className="mr-2 h-5 w-5" />
                        Delivery Method
                      </CardTitle>
                      <CardDescription>
                        Choose how you want to receive your order
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup
                        value={form.watch("deliveryMethod")}
                        onValueChange={(value) =>
                          handleSelectChange("deliveryMethod", value)
                        }
                        className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem
                            value="pickup"
                            id="pickup"
                            className="mt-1"
                          />
                          <div className="grid gap-1.5 leading-none flex-1">
                            <Label htmlFor="pickup" className="font-medium">
                              Store Pickup (Free)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Pick up your order from our store
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <RadioGroupItem
                            value="home-delivery"
                            id="home-delivery"
                            className="mt-1"
                          />
                          <div className="grid gap-1.5 leading-none flex-1">
                            <Label
                              htmlFor="home-delivery"
                              className="font-medium">
                              Home Delivery
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Home delivery across Nigeria
                            </p>
                          </div>
                        </div>
                      </RadioGroup>

                      {/* Pickup Location Selector */}
                      {form.watch("deliveryMethod") === "pickup" && (
                        <motion.div
                          className="space-y-4 pt-2 border-t"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}>
                          <PickupLocations
                            onStationSelect={(station) => {
                              setSelectedStation(station);
                              form.setValue("stationId", station.StationId);
                              form.trigger("stationId");
                            }}
                            onPickupLocationSelect={(location) => {
                              setSelectedPickupLocation(location);
                              form.setValue(
                                "pickupLocation",
                                location.ServiceCentreId.toString(),
                              );
                              form.trigger("pickupLocation");
                            }}
                          />
                          {form.formState.errors.stationId && (
                            <p className="text-sm text-red-500">
                              {form.formState.errors.stationId.message}
                            </p>
                          )}
                        </motion.div>
                      )}

                      {/* Home Delivery Address Search */}
                      {form.watch("deliveryMethod") === "home-delivery" && (
                        <motion.div
                          className="space-y-4 pt-4 border-t"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}>
                          <div>
                            <h3 className="text-sm font-semibold mb-3">
                              Delivery Address
                            </h3>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="address">
                                  Search Your Address
                                </Label>
                                <LocationSearch
                                  onLocationSelect={(location) => {
                                    form.setValue("address", location.address);
                                    form.setValue("city", location.city);
                                    form.setValue("state", location.state);
                                    form.setValue(
                                      "latitude",
                                      location.latitude,
                                    );
                                    form.setValue(
                                      "longitude",
                                      location.longitude,
                                    );
                                  }}
                                  placeholder="Search for your delivery address in Nigeria"
                                  disabled={false}
                                />
                                {form.formState.errors.address && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.address.message}
                                  </p>
                                )}
                              </div>

                              {/* Display selected address details */}
                              {form.watch("address") && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-4">
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 mt-0.5 text-accent-blue flex shrink-0" />
                                      <div>
                                        <p className="font-medium">
                                          {form.watch("address")}
                                        </p>
                                        {form.watch("city") &&
                                          form.watch("state") && (
                                            <p className="text-muted-foreground">
                                              {form.watch("city")},{" "}
                                              {form.watch("state")}
                                            </p>
                                          )}
                                      </div>
                                    </div>
                                    {/* {form.watch("latitude") &&
                                      form.watch("longitude") && (
                                        <p className="text-xs text-muted-foreground pt-2">
                                          Coordinates:{" "}
                                          {form.watch("latitude")?.toFixed(4)},{" "}
                                          {form.watch("longitude")?.toFixed(4)}
                                        </p>
                                      )} */}
                                  </div>
                                </motion.div>
                              )}

                              {/* Save Address for Future */}
                              {form.watch("address") && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="saveAddress"
                                      checked={saveNewAddress}
                                      onCheckedChange={(checked) =>
                                        setSaveNewAddress(checked === true)
                                      }
                                    />
                                    <Label
                                      htmlFor="saveAddress"
                                      className="text-sm font-normal cursor-pointer">
                                      Save this address for future orders
                                    </Label>
                                  </div>

                                  {saveNewAddress && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      className="space-y-2">
                                      <Label
                                        htmlFor="addressLabel"
                                        className="text-sm">
                                        Address Label
                                      </Label>
                                      <Input
                                        id="addressLabel"
                                        placeholder="e.g., Home, Office, Mom's place"
                                        value={newAddressLabel}
                                        onChange={(e) =>
                                          setNewAddressLabel(e.target.value)
                                        }
                                      />
                                    </motion.div>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Shipping Cost Display for Home Delivery */}
                      {form.watch("deliveryMethod") === "home-delivery" && (
                        <motion.div
                          className="pt-4 border-t"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}>
                          <ShippingCostDisplay
                            deliveryMethod={form.watch("deliveryMethod")}
                            quantity={items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            )}
                            weight={0.01}
                            items={items}
                            stateId={
                              form.watch("state")
                                ? getStateIdByName(form.watch("state")) ||
                                  undefined
                                : undefined
                            }
                            latitude={form.watch("latitude")}
                            longitude={form.watch("longitude")}
                            address={form.watch("address")}
                            onCostCalculated={(cost) =>
                              setCalculatedShippingCost(cost)
                            }
                          />
                        </motion.div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="text-foreground cursor-pointer"
                        onClick={handleNextStep}>
                        Continue to Payment
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}>
                  <Card className="bg-card text-card-foreground">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Payment Method
                      </CardTitle>
                      <CardDescription>
                        Select your preferred payment method
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={form.watch("paymentMethod")}
                        onValueChange={(value) =>
                          handleSelectChange("paymentMethod", value)
                        }
                        className="space-y-4">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className="flex items-start space-x-3">
                            <RadioGroupItem
                              value={method.id}
                              id={method.id}
                              className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor={method.id}
                                className="font-medium">
                                {method.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {method.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>

                      {form.watch("paymentMethod") === "paystack" && (
                        <motion.div
                          className="mt-6 p-4 bg-accent-blue/20 rounded-lg"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}>
                          <p className="text-sm">
                            You will be redirected to Paystack to complete your
                            payment securely.
                          </p>
                        </motion.div>
                      )}

                      <div className="mt-6">
                        <Button
                          type="submit"
                          className="w-full text-foreground cursor-pointer
                          "
                          disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Complete Order"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="w-full">
                        Back to Delivery
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="bg-card text-card-foreground sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item) => {
                    const hasCustomization =
                      item.customization?.hasCustomDesign;
                    const cardColor = item.selectedColor;

                    return (
                      <div
                        key={item.slug}
                        className="flex items-start gap-3 sm:gap-4">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm">
                            <div className="flex items-center gap-1">
                              <span>{item.quantity}x</span>
                              <span className="truncate">{item.title}</span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>

                          {(hasCustomization || cardColor) && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Palette className="h-3 w-3" />
                                <span>
                                  {cardColor
                                    ? `Customized (${cardColor})`
                                    : "Customized"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(baseSubtotal)}</span>
                  </div>

                  {customizationFees > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Customization Fees
                      </span>
                      <span>{formatCurrency(customizationFees)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT (7.5%)</span>
                    <span>{formatCurrency(vatAmount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {deliveryPrice > 0
                        ? formatCurrency(deliveryPrice)
                        : "Free"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </form>
    </MaxWidthWrapper>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <MaxWidthWrapper className="py-20 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
        </MaxWidthWrapper>
      }>
      <CheckoutPageContent />
    </Suspense>
  );
}
