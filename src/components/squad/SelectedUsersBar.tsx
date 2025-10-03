"use client";

import { SquadFormDialog } from "@/components/squad/squad-form-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Sparkles, Users, X } from "lucide-react";
import { useState } from "react";

interface Student {
  zid: string;
  first_name: string;
  last_name: string;
  profile_url: string;
}

interface SelectedUsersBarProps {
  selectedUsers: string[];
  students: Student[];
  onRemove: (zid: string) => void;
  onFormSquad: (
    name: string,
    description: string,
    course: string,
    currentUserId: string
  ) => Promise<void>;
  squadCourse: string | null;
  commonCoursesIntersection: string[];
  currentUserId: string;
}

const SelectedUsersBar = ({
  selectedUsers,
  students,
  onRemove,
  onFormSquad,
  squadCourse,
  commonCoursesIntersection,
  currentUserId,
}: SelectedUsersBarProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const selectedStudents = students.filter((s) =>
    selectedUsers.includes(s.zid)
  );
  const canFormSquad =
    squadCourse !== null || commonCoursesIntersection.length > 0;
  const showWarning =
    selectedUsers.length >= 2 && commonCoursesIntersection.length === 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t shadow-2xl z-50"
    >
      <div className="container mx-auto px-3 py-1.5 md:py-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1.5 md:gap-3">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-1.5 mb-1">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3,
                }}
              >
                <Users className="h-3.5 w-3.5 text-primary" />
              </motion.div>
              <h3 className="text-xs font-semibold text-foreground">
                Selected
              </h3>
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {selectedUsers.length}
              </span>
              <AnimatePresence>
                {showWarning && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30"
                  >
                    <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    <span className="text-[10px] text-orange-800 dark:text-orange-300 font-medium">
                      No common courses
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-1.5 pb-0.5">
                {selectedStudents.map((student, index) => (
                  <motion.div
                    key={student.zid}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full pl-0.5 pr-2 py-0.5 border border-primary/20 shadow-sm"
                  >
                    <Avatar className="h-5 w-5 md:h-6 md:w-6 ring-2 ring-background">
                      <AvatarImage
                        src={student.profile_url || "/placeholder.svg"}
                        alt={student.first_name}
                      />
                      <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {student.first_name[0]}
                        {student.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] md:text-xs font-medium text-foreground whitespace-nowrap">
                      {student.first_name} {student.last_name}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemove(student.zid)}
                      className="h-3.5 w-3.5 rounded-full bg-primary/20 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                    >
                      <X className="h-2.5 w-2.5 text-primary hover:text-destructive" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={canFormSquad ? { scale: 1.05 } : {}}
                  whileTap={canFormSquad ? { scale: 0.95 } : {}}
                  className="w-full md:w-auto"
                >
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    disabled={!canFormSquad}
                    size="sm"
                    className={`w-full md:w-auto bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground shadow-lg px-4 md:px-6 relative overflow-hidden group h-7 md:h-8 ${
                      !canFormSquad ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {canFormSquad && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 1,
                        }}
                      />
                    )}
                    <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 relative z-10" />
                    <span className="relative z-10 text-xs md:text-sm">
                      Form Squad
                    </span>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              {!canFormSquad && (
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">
                    {selectedUsers.length < 2
                      ? "Select at least 2 students to form a squad"
                      : commonCoursesIntersection.length === 0
                      ? "Selected students must have at least one course in common"
                      : "Select a single course filter to form a squad"}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <SquadFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={onFormSquad}
        selectedStudents={selectedStudents}
        squadCourse={squadCourse}
        commonCoursesIntersection={commonCoursesIntersection}
        currentUserId={currentUserId}
      />
    </motion.div>
  );
};

export default SelectedUsersBar;
