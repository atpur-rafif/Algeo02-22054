import React, { useEffect } from 'react';
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName


export default function() {

    return (
        <div className="flex-grow w-full h-full overflow-x-hidden">
            <div className='m-12 relative flex flex-col items-center justify-center'>
                <div className="absolute w-full top-0 flex flex-col h-[16rem] -z-50 items-center bg-blue-300 rounded-xl" />

                <p className="font-semibold text-3xl mt-6 mb-1">iCBIR - Image Retriever</p>
                <p className="text mb-4"><i>by</i>  Frontend: Prolog / Backend: Haskell</p>
                <img src="/FotoAlgeo.jpg" className="max-w-[20rem] max-h-[20rem] rounded-xl hover:max-w-[26rem] hover:max-h-[26rem] transition-all duration-300"/>
                <p className='mt-2 text-sm'>Kiri ke kanan: Afif, Ben, Qais</p>

                <div className=' w-full h-full mt-4 max-w-[500px]'>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>About Us</AccordionTrigger>
                            <AccordionContent className='flex flex-col gap-5'>
                                <p>iCBIR adalah sebuah website yang memberikan layanan untuk mencari gambar yang mirip dengan input user.</p>
                                <p>Website ini merupakan hasil Tugas Besar 2 IF 2123 Aljabar Linier dan Geometri tentang Aplikasi Aljabar Vektor dalam Sistem Temu Balik Gambar.</p>
                                <div>
                                    <p>Proyek iCBR ini dibuat oleh:</p>
                                    <ul className='ml-6'>
                                        <li>- Benjamin Sihombing / 13522054</li>
                                        <li>- Muhammad Atpur Rafif / 13522086</li>
                                        <li>- Muhammad Rasheed Qais Tandjung / 13522158</li>
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How to Use</AccordionTrigger>
                            <AccordionContent className='flex flex-col gap-2'>
                                <p>1. Buka halaman dataset dan tambahkan folder dataset pada Add New (Folder).</p>
                                <p>2. Masukkan gambar yang ingin dicari pada halaman home.</p>
                                <p>3. Pilih metode pencarian (Color atau Texture).</p>
                                <p>4. Gambar-gambar pada dataset yang memiliki kemiripan ≥60% dengan gambar input akan ditampilkan secara terurut dari yang tertinggi.</p>
                                <p>5. Selain mengupload gambar dari device, pengguna juga dapat menggunakan fitur Camera untuk menggunakan tangkapan gambar langsung (live) dari webcam sebagai input gambar.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Tentang CBIR</AccordionTrigger>
                            <AccordionContent className='flex flex-col gap-2'>
                                <p>Website ini menggunakan teknik <i>Content-Based Image Retrieval</i> untuk mencari gambar. </p>
                                <p>CBIR adalah teknik mencari menggambar berdasarkan kontennya.</p>
                                <p>Pada proyek ini, konten gambar yang digunakan adalah warna dan tekstur.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}