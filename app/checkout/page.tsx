"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  MapPin,
  Truck,
  Palette,
  Loader2,
  Plus,
  Check,
  Star,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

import { useCartStore } from "@/lib/store/cart-store";
import { checkoutFormSchema, CheckoutFormValues } from "@/lib/schemas";
import {
  formatCurrency,
  deliveryOptions,
  paymentMethods,
  calculateVAT,
} from "@/lib/utils";
import { submitCheckout } from "@/actions/checkout";
import {
  getSavedAddresses,
  createSavedAddress,
  SavedAddress,
} from "@/actions/address";

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
  const selectedDelivery = deliveryOptions.find(
    (option) => option.id === form.watch("deliveryMethod"),
  );
  const deliveryPrice = selectedDelivery?.price || 0;
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
    if (name === "deliveryMethod" && value !== "pickup") {
      form.setValue("pickupLocation", "");
    }
    form.trigger(name);
  };

  type FieldName = keyof CheckoutFormValues;
  const fieldsToValidate: Record<number, FieldName[]> = {
    1: ["firstName", "lastName", "email", "phone", "address", "city", "state"],
    2: ["deliveryMethod", "pickupLocation"],
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentFields = fieldsToValidate[step as 1 | 2];
    if (currentFields) {
      const isValid = await form.trigger(currentFields);
      if (isValid) {
        setStep(step + 1);
      } else {
        toast.error("Please fill out all required fields correctly.");
      }
    } else {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (step !== 3) return;
    setIsSubmitting(true);
    setError(null);

    try {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MaxWidthWrapper className="py-20 sm:py-12 lg:pt-20  text-white min-h-screen">
      <motion.h1
        className="text-3xl font-bold my-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}>
        Checkout
      </motion.h1>

      {error && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

                      {/* Address Form (show if no saved addresses or new address selected) */}
                      {(showNewAddressForm || savedAddresses.length === 0) &&
                        !loadingAddresses && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-4">
                            {savedAddresses.length > 0 && <Separator />}

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                  id="firstName"
                                  {...form.register("firstName")}
                                />
                                {form.formState.errors.firstName && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.firstName.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                  id="lastName"
                                  {...form.register("lastName")}
                                />
                                {form.formState.errors.lastName && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.lastName.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  {...form.register("email")}
                                />
                                {form.formState.errors.email && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.email.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" {...form.register("phone")} />
                                {form.formState.errors.phone && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.phone.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                {...form.register("address")}
                              />
                              {form.formState.errors.address && (
                                <p className="text-sm text-red-500">
                                  {form.formState.errors.address.message}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" {...form.register("city")} />
                                {form.formState.errors.city && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.city.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input id="state" {...form.register("state")} />
                                {form.formState.errors.state && (
                                  <p className="text-sm text-red-500">
                                    {form.formState.errors.state.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Save Address Checkbox */}
                            <div className="pt-2 space-y-3">
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
                                  <Label htmlFor="addressLabel">
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
                            </div>
                          </motion.div>
                        )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="ml-auto">
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
                    <CardContent>
                      <RadioGroup
                        value={form.watch("deliveryMethod")}
                        onValueChange={(value) =>
                          handleSelectChange("deliveryMethod", value)
                        }
                        className="space-y-4">
                        {deliveryOptions.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-start space-x-3">
                            <RadioGroupItem
                              value={option.id}
                              id={option.id}
                              className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none flex-1">
                              <Label
                                htmlFor={option.id}
                                className="font-medium">
                                {option.name}{" "}
                                {option.price > 0
                                  ? `(${formatCurrency(option.price)})`
                                  : "(Free)"}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>

                              {option.id === "pickup" &&
                                form.watch("deliveryMethod") === "pickup" && (
                                  <motion.div
                                    className="mt-3"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    transition={{ duration: 0.3 }}>
                                    <Label
                                      htmlFor="pickupLocation"
                                      className="text-sm mb-2 block">
                                      Select Pickup Location
                                    </Label>
                                    <Select
                                      value={form.watch("pickupLocation")}
                                      onValueChange={(value) =>
                                        handleSelectChange(
                                          "pickupLocation",
                                          value,
                                        )
                                      }>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a store location" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(option.locations || []).map(
                                          (location) => (
                                            <SelectItem
                                              key={location.id}
                                              value={location.id}>
                                              {location.name}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                    {form.formState.errors.pickupLocation && (
                                      <p className="text-sm text-red-500 mt-1">
                                        {
                                          form.formState.errors.pickupLocation
                                            .message
                                        }
                                      </p>
                                    )}
                                    {form.watch("pickupLocation") && (
                                      <motion.p
                                        className="text-sm text-muted-foreground mt-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}>
                                        {option.locations?.find(
                                          (l) =>
                                            l.id ===
                                            form.watch("pickupLocation"),
                                        )?.address || ""}
                                      </motion.p>
                                    )}
                                  </motion.div>
                                )}
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="button" onClick={handleNextStep}>
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
                          className="w-full"
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
