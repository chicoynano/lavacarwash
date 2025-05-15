
"use client";

import * as z from "zod";
import React, { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CarIcon, Loader2, SparklesIcon, UsersIcon, MailIcon, PhoneIcon, MapPinIcon, FileTextIcon, ClockIcon, MessageSquareIcon, CreditCardIcon } from "lucide-react"; // Added more icons

import Link from 'next/link';
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Español para el calendario

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from 'next/image';


import { cn } from "@/lib/utils";
import type { Service } from "@/types";
import { getServices } from "@/app/lib/get-services"; // Ensure this path is correct
import { saveBooking, type BookingFormInput } from "@/app/actions";
import { useToast } from "@/hooks/use-toast"; // Import useToast

import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
// Client-side Zod schema with Spanish error messages
const bookingSchemaClient = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce una dirección de correo electrónico válida." }),
  phone: z.string().min(9, { message: "Por favor, introduce un número de teléfono válido (mínimo 9 dígitos)." }),
  address: z.string().min(5, { message: "Por favor, introduce una dirección válida." }),
  serviceId: z.string().min(1, { message: "Por favor, selecciona un servicio." }),
  date: z.date({ required_error: "Por favor, selecciona una fecha."}),
  time: z.string().min(1, { message: "Por favor, selecciona un horario." }),
  comments: z.string().optional(),
  payNow: z.boolean().optional(),
});


// Example time slots - these might also need translation depending on format preference
const timeSlots = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00",  "14:00", "15:00",  "16:00",  "17:00", "18:00", "19:00", "20:00"
];

export function BookingForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [payNow, setPayNow] = useState(false); // Estado para el checkbox "Pagar ahora"

  const form = useForm<BookingFormInput>({
    resolver: zodResolver(bookingSchemaClient),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      serviceId: "",
      date: undefined,
      time: "",
      comments: "",
      payNow: false,
    },
    // defaultValues.payNow will be overridden by local state if needed for controlled component
  });

  useEffect(() => {
    async function fetchServices() {
      setIsLoadingServices(true);
      try {
        const fetchedServices = await getServices();
        setServices(fetchedServices);
      } catch (error) {
        console.error("Failed to load services:", error);
        toast({
            title: "Error al Cargar Servicios",
            description: "No se pudieron cargar los servicios. Por favor, inténtalo de nuevo más tarde.",
            variant: "destructive",
          });
      } finally {
        setIsLoadingServices(false);
      }
    }
    fetchServices();
  }, [toast]);

  function onSubmit(data: BookingFormInput) {
    startTransition(async () => {
      console.log("Form data being sent:", data); // Log form data

      // Merge form data with the local payNow state
      const dataWithPayNow = { ...data, payNow: payNow };

      const result = await saveBooking(dataWithPayNow);
      
      if (result.success) {
        toast({
          title: "¡Reserva Enviada!",
          description: result.message || "Hemos recibido tu solicitud de reserva. Revisa tu correo para la confirmación.",
          variant: "default", // Greenish for success
          className: "bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300",

        });
        // Handle Stripe redirection if needed
        if (result.stripeCheckoutUrl) { window.location.href = result.stripeCheckoutUrl; }
        form.reset();
      } else {
        toast({
          title: "Fallo en la Reserva",
          description: result.message || "No se pudo guardar la reserva. Por favor, comprueba tus datos e inténtalo de nuevo.",
          variant: "destructive",
        });
         if (result.errors) {
           result.errors.forEach((err) => {
            // Ensure err.path is not empty and err.path[0] is a valid key
            if (err.path && err.path.length > 0) {
              form.setError(err.path[0] as keyof BookingFormInput, { // Type assertion might be needed
                type: "server",
                message: err.message,
              });
            }
           });
           console.error("Validation Errors:", result.errors);
         }
      }
    });
  
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-border/40 rounded-xl bg-card overflow-hidden">
      <CardHeader className="pb-4 bg-muted/30 border-b border-border/40 p-6">
         <div className="flex items-center justify-center mb-2">
         <Link href="./">
            <Image title="Inicio" src="/favicon.ico" alt="LavaCarWash Logo" width={50} height={50} className="h-12 w-auto object-contain rounded-md mr-3" data-ai-hint="car wash logo"/></Link>
            <CardTitle className="text-3xl font-bold text-center text-primary tracking-tight">
            Reserva tu lavado de coche
            </CardTitle>
        </div>
        <CardDescription className="text-center text-muted-foreground text-sm">
        Elige el servicio, la fecha y dinos cómo contactarte.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Nombre Completo</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input className="pl-10 py-2.5 text-base md:text-sm" placeholder="Ej: Juan Pérez" {...field} />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* Email */}
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Correo Electrónico</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input className="pl-10 py-2.5 text-base md:text-sm" type="email" placeholder="tuemail@ejemplo.com" {...field} />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* Phone */}
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Número de Teléfono</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input className="pl-10 py-2.5 text-base md:text-sm" type="tel" placeholder="Ej: +34 600 000 000" {...field} />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* Address */}
                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Dirección del Servicio</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input className="pl-10 py-2.5 text-base md:text-sm" placeholder="Calle, Número, Ciudad" {...field} />
                        </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground mt-1">
                        ¿Dónde debemos realizar el lavado?
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Service */}
                <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                    <FormItem className="md:col-span-1">
                    <FormLabel className="text-sm font-medium text-foreground">Tipo de Servicio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingServices} >
                        <FormControl>
                        <SelectTrigger className="py-2.5 text-base md:text-sm focus:ring-primary focus:border-primary">
                            <div className="flex items-center">
                            <FileTextIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                            <SelectValue placeholder={isLoadingServices ? "Cargando..." : "Selecciona un servicio"} />
                            </div>
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {!isLoadingServices && services.length > 0 ? (
                            services.map((service) => (
                            <SelectItem key={service.id} value={service.id} className="text-base md:text-sm">
                                {service.name} - {service.price.toFixed(2)} €
                            </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="loading" disabled className="text-base md:text-sm">
                            {isLoadingServices ? "Cargando servicios..." : "No hay servicios disponibles"}
                            </SelectItem>
                        )}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* Date */}
            <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col md:col-span-1">
                    <FormLabel className="text-sm font-medium text-foreground">Fecha</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                        <Button
    variant={"outline"}
    className={cn(
      "justify-start text-left font-normal py-2.5 text-base md:text-sm hover:bg-muted/50 focus:ring-primary focus:border-primary", // Eliminado w-full
      !field.value && "text-muted-foreground"
  )}
  
>
    <CalendarIcon className="mr-2 h-5 w-5 opacity-70" />
    {field.value ? (
        format(field.value, "PPP", { locale: es })
    ) : (
        <span>Elije fecha</span>
    )}
</Button>

                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) || date > new Date(new Date().setDate(new Date().getDate() + 60)) // Example: allow booking up to 60 days in advance
                            }
                            initialFocus
                            locale={es} // Use Spanish locale
                          />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* Time */}
                <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                    <FormItem className="md:col-span-1">
                    <FormLabel className="text-sm font-medium text-foreground">Horario</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="py-2.5 text-base md:text-sm focus:ring-primary focus:border-primary">
                           <div className="flex items-center">
                            <ClockIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                            <SelectValue placeholder="Selecciona un horario" />
                            </div>
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot} className="text-base md:text-sm">
                            {slot}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>


            {/* Comments */}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Comentarios Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                    <MessageSquareIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Textarea
                      placeholder="¿Alguna instrucción especial para el servicio? (ej., enfocar en llantas, tipo de vehículo, etc.)"
                      className="resize-none pl-10 py-2.5 text-base md:text-sm min-h-[100px]"
                      {...field}
                    />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkbox Pagar ahora */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="payNow"
                checked={payNow}
                onCheckedChange={(checked) => setPayNow(checked as boolean)}
              />
              <label
                htmlFor="payNow"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pagar ahora (Requiere confirmación de pago inmediato)
              </label>
            </div>

             {/* Submit Button */}
             <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-base md:text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 active:scale-[0.98]"
                disabled={isPending || isLoadingServices}
            >
              {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando Reserva...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="mr-2 h-5 w-5" />
                    Reservar Mi Lavado Ahora
                    <CarIcon className="ml-2 h-5 w-5" />
                  </>
                )}
            </Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}