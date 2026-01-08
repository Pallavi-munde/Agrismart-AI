import java.util.InputMismatchException;
import java.util.Scanner;

class InsufficientFundsException extends Exception {
    InsufficientFundsException(String message) { super(message); }
}

class BankAccount {
    private double balance;

    BankAccount(double balance) {
        this.balance = balance;
    }

    void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit amount must be positive.");
        balance += amount;
        System.out.println("Deposited: " + amount);
        System.out.println("Current balance: " + balance);
    }

    void withdraw(double amount) throws InsufficientFundsException {
        if (amount <= 0) throw new IllegalArgumentException("Withdrawal amount must be positive.");
        if (amount > balance) throw new InsufficientFundsException("Insufficient balance: attempted to withdraw " + amount + ", but balance is " + balance + ".");
        balance -= amount;
        System.out.println("Withdrawn: " + amount);
        System.out.println("Current balance: " + balance);
    }
}

public class BankingApplication {
    public static void main(String[] args) {
        BankAccount account = new BankAccount(5000);

        try (Scanner sc = new Scanner(System.in)) {
            System.out.print("Enter deposit amount: ");
            double d = sc.nextDouble();
            account.deposit(d);

            System.out.print("Enter withdrawal amount: ");
            double w = sc.nextDouble();
            account.withdraw(w);

        } catch (InsufficientFundsException e) {
            System.out.println("Error: " + e.getMessage());
        } catch (InputMismatchException e) {
            System.out.println("Invalid input. Please enter a numeric value.");
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
        }
    }
}