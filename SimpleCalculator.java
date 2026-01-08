import java.util.InputMismatchException;
import java.util.Scanner;

public class SimpleCalculator {
    public static void main(String[] args) {
        try (Scanner sc = new Scanner(System.in)) {
            System.out.print("Enter first number: ");
            double a = sc.nextDouble();

            System.out.print("Enter second number: ");
            double b = sc.nextDouble();

            System.out.print("Enter operator (+, -, *, /): ");
            String op = sc.next().trim();

            double result;
            switch (op) {
                case "+" -> result = a + b;
                case "-" -> result = a - b;
                case "*" -> result = a * b;
                case "/" -> {
                    if (b == 0) throw new ArithmeticException("Division by zero.");
                    result = a / b;
                }
                default -> throw new IllegalArgumentException("Invalid operator: " + op);
            }

            System.out.println("Result: " + result);
        } catch (InputMismatchException e) {
            System.out.println("Invalid numeric input.");
        } catch (ArithmeticException | IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
        }
    }
}