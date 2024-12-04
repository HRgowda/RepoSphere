"use client"

import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenuItem, SidebarMenuButton, SidebarMenu, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Bot, Presentation, CreditCard, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import useProject from "@/hooks/use-project"

export function AppSideBar() {

  const items = [
    {
      title: "Dashboard",
      url: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: "Q&A",
      url: '/qa',
      icon: Bot
    }
  ]

  // const projects = [
  //   {
  //     name: "Project 1"
  //   },
  //   {
  //     name: "Project 2"
  //   },
  //   {
  //     name: "Project 3"
  //   }
  // ]

  const pathname = usePathname
  const {open} = useSidebar()
  const { projects, projectId, setProjectId } = useProject();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2 ">
          <Image src='/logo.png' alt="logo" width={40} height={40}></Image>
          {open && (
              <h1 className="text-xl font-bold text-primary/80">
                RepoSphere
              </h1>
          )}

        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item: any) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className={cn({
                        '!bg-primary text-white' : pathname === item.url
                      }, 'list-none')}>
                        
                        <item.icon />
                        <span>{item.title}</span>

                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            Your Projects
          </SidebarGroupLabel>
          <SidebarContent>
            <SidebarMenu>
              {projects?.map((project: any) => {
                 return (
                 <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton asChild>
                    <div onClick={() => {
                      setProjectId(project.id)
                    }}>
                      <div className={cn(
                        'rounded-sm border size-6 flex items justify-center text-sm bg-white text-primary', {
                          'bg-primary text-white' : project.id === projectId
                        }
                      )}>
                        {project.name[0]}

                      </div>
                      <span>
                        {project.name}
                      </span>
                    </div>

                  </SidebarMenuButton>

                </SidebarMenuItem>
                 )
              })}
              <div className="h-2"></div>

              {open && (
                <SidebarMenuItem>
                  <Link href={'/create'}>
                    <Button variant={"outline"} className="w-fit size-sm">
                      <Plus />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}